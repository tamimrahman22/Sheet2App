var express = require('express');
var router = express.Router();
const appModel = require('../models/Apps');
const dataSourceModel = require('../models/DataSource');
const viewsModel = require('../models/View');
const { google } = require("googleapis");
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
	// keyFile: "./keys.json",
	keyFile: "keys.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
});

// add data sources to application that was created, need id of application (created by mongo when app is created), url to sheet, 
// sheet index (which sheet is being looked at), and keys
router.post('/add', async (req, res) => {
	const { appId, dataSourceName, url, sheetIndex, keys } = req.body;

	const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

	try {
		
		// Check if the data source name is not empty!-
		if (!dataSourceName) {
			console.error('Error: No data source name was given!');
			return res.status(400).json({ message: 'Data source name cannot be empty.' });
		}

		// get spreadsheet Id of dataSource
		const regex = /\/d\/(.*?)\/edit/;
		const match = url.match(regex);
		const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/
		const response = await googleSheetsInstance.spreadsheets.get({
			spreadsheetId,
			auth,
		});

		// Check if the the index that was specified by the user is in range 
		if (sheetIndex < 0 || sheetIndex >= response.data.sheets.length) {
			console.error('Error: Invalid sheet index provided!');
			return res.status(400).json({ message: 'Invalid sheet index provided.' });
		}

		//Get the name of the spreadsheet
		const spreadSheetName = response.data.properties.title;

		for(let i = 0; i < response.data.sheets.length; i++){
			// parse through sheets, find spreadsheet that is the same index and get the name of that sheet
			if(response.data.sheets[i].properties.index == sheetIndex){
				let columns = [];
				// Name of the sheet within a spreadsheet 
				let sheetName = response.data.sheets[i].properties.title;
				
				// get column names in sheet
				const readColumns = await googleSheetsInstance.spreadsheets.values.get({
					auth, //auth object
					spreadsheetId, // spreadsheet id
					range: `${sheetName}!1:1`, //range of cells to read from.
				})

				// get type for each column
				const readData = await googleSheetsInstance.spreadsheets.values.get({
					auth, //auth object
					spreadsheetId, // spreadsheet id
					range: `${sheetName}!2:2`, //range of cells to read from.
					valueRenderOption: 'UNFORMATTED_VALUE',
    				dateTimeRenderOption: 'SERIAL_NUMBER'
				})

				// check if we received any data
				if (!readColumns.data.values || !readData.data.values) {
					console.error('Error: No data parsed!');
					return res.status(400).json({ message: 'The specified sheet does not contain data.' });
				}

				// create dataSource, need to add columns next
				const newDataSource = await dataSourceModel.create({
					// Name of the sheet
					sheetName: sheetName, 
					// Name of the spredsheet
					spreadSheetName: spreadSheetName,
					// Name of the data source --> default to the name of the data source
					dataSourceName: dataSourceName, 
					// URL to the Spreadsheet
					url: url,
					// Index of the sheet 
					sheetIndex: sheetIndex,
					// Key column which will be specified by the user 
					keys: keys,
					// columns: columns
				});

				// get column names, and look at first value in order to get the type of the values in the column
				let columnNames = readColumns.data.values[0];
				let columnFirstValues = readData.data.values[0];

				let referenceId = newDataSource.id;
				for(let j = 0; j < columnNames.length; j++){
					let urlRegex = /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
					if(urlRegex.test(columnFirstValues[j])) {
						columns.push({
							name: columnNames[j],
							label: false,
							// reference: referenceId,
							type: "url"
						})
					}
					else{
						columns.push({
							name: columnNames[j],
							label: false,
							// reference: referenceId,
							type: typeof columnFirstValues[j]
						})
					}
				}
			
				// update the columns of datasource
				const updatedDataSource = await dataSourceModel.findOneAndUpdate(
					{ _id: referenceId },
					{"columns": columns},
				);
				console.log(updatedDataSource);

				// add dataSource to the respective application
				const currentApp = await appModel.findById( { _id: appId } );
				let currentDataSources = currentApp.dataSources;
				currentDataSources.push(updatedDataSource);
				const updatedApp = await appModel.findOneAndUpdate(
					{ _id: appId },
					{dataSources: currentDataSources},
				);

				console.log(currentApp);
				
				await logFile(appId, url + " " + sheetIndex + " data source added to app " + updatedApp.name);
				// Send the updated applicationg back to the user!
				res.send(await appModel.findById({ _id: appId }))
			}
		}
	}
	catch (error){
		console.error('Error: ', error);
		await logFile(appId, "Error in adding data source: " + url);
		const currentApp = await appModel.findById( { _id: appId } );
		res.status(400).json({ message: `Error in adding data source for app ${currentApp.name}` });
	}
});

router.post('/getColumns', async (req, res) => {
	const { url, name } = req.body;
	// const name = "Sheet1";

	const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

	try {
		// get spreadsheet Id of dataSource
		const regex = /\/d\/(.*?)\/edit/;
		const match = url.match(regex);
		const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/

		const response = await googleSheetsInstance.spreadsheets.get({
			spreadsheetId,
			auth,
		});

		const readData = await googleSheetsInstance.spreadsheets.values.get({
			auth, //auth object
			spreadsheetId, // spreadsheet id
			range: `${name}`, //range of cells to read from.
		})

		// get each column and put into array
		let finalList = [];
		for(let i = 0; i < readData.data.values[0].length; i++){
			let tempList = [];
			for(let j = 0; j < readData.data.values.length; j++){
				tempList.push(readData.data.values[j][i]);
			}
			finalList.push(tempList);
		}

		// console.log(readData.data.values);
		console.log(finalList);
		res.send(finalList);
	}
	catch (error){
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in getting column for data source ${url}` });
	}
});

router.post('/getRows', async (req, res) => {
	const { url, index } = req.body;
	// const name = "Sheet1";

	const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

	try {
		// get spreadsheet Id of dataSource
		const regex = /\/d\/(.*?)\/edit/;
		const match = url.match(regex);
		const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/

		const response = await googleSheetsInstance.spreadsheets.get({
			spreadsheetId,
			auth,
		});

		let name = "";
		for (let i = 0; i < response.data.sheets.length; i++) {
			const sheet = response.data.sheets[i];
			console.log(sheet.properties.index);
			console.log(index);
			if (sheet.properties.index === index) {
				name = sheet.properties.title;
				break;
			}
		}

		const readData = await googleSheetsInstance.spreadsheets.values.get({
			auth, //auth object
			spreadsheetId, // spreadsheet id
			range: `${name}`, //range of cells to read from.
		})

		res.send(readData.data.values);
	}
	catch (error){
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in getting column for data source ${url}` });
	}
});

router.get('/getByAppId/:id', async(req, res) => {
	// get application
	// console.log();
	try {
		const currentApp = await appModel.findById(req.params.id);
		// console.log(currentApp.dataSources);
		let finalList = [];
		for(let i = 0; i < currentApp.dataSources.length; i++){
			finalList.push(await dataSourceModel.findById({ _id: currentApp.dataSources[i] }));
		}
		res.send(finalList);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({message: `Error in getting app data sources`});
	}
});

router.get('/get/:id', async(req, res) => {
	// get application
	// console.log();
	try {
		const datasource = await dataSourceModel.findById(req.params.id);
		console.log(datasource);
		res.send(datasource);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({message: `Error in getting data source`});
	}
});

router.post("/rename", async(req, res) => {
	// update the name of an application
	const {appId, name, dataSourceID} = req.body;
	try {
		// Change the name of the data source! 
		const updatedDataSource = await dataSourceModel.findOneAndUpdate(
			{ _id: dataSourceID },
			{ dataSourceName: name },
		);
		
		const list = await appModel.find({ });
		let newAppId = '';
		for(let i = 0; i < list.length; i++){
			if(list[i].dataSources.includes(dataSourceID)){
				newAppId = list[i].id;
			}
		} 

		await logFile(newAppId, name + " data source renamed");
		res.send(updatedDataSource);
	}
	catch (err) {
		console.error('Error: ', err);
		await logFile(appId, "Error in renaming the data source " + dataSourceID);
		res.status(400).json({ message: `Error in renaming the data source!`});
	}
})

router.post("/setKeys", async(req, res) => {
	// update the name of an application
	const {appID, keyName, dataSourceID} = req.body;
	try {
		// Change the name of the data source! 
		const updatedDataSource = await dataSourceModel.findOneAndUpdate(
			{ _id: dataSourceID },
			{ keys: keyName },
		);
		// Write to the log file
		const logMessage = `Data source ${dataSourceID} key name set to ${keyName}`
		await logFile(appID, logMessage);

		res.send(updatedDataSource);
	}
	catch (err) {
		// Write to log file
		const logMessage = `Error in setting data source ${dataSourceID} key name`
		await logFile(appID, logMessage);

		res.status(400).json({ message: `Error in renaming the data source!`});
	}
})

router.post("/delete", async (req, res) => {
	const { appId, dataSourceID } = req.body;
	try {
	  // DELETE FROM THE DATA SOURCES COLLECTION
	  const response = await dataSourceModel.deleteOne({ _id: dataSourceID });
	  console.log(response);
	  if (response.deletedCount != 1) {
		throw new Error("Deletion unsuccessful or incorrect amount");
	  }
  
	  // DELETE VIEWS USING DATA SOURCE
	  const views = await viewsModel.find({ table: dataSourceID });
	  console.log(views);
	  views.forEach((element) => {
		console.log(element._id);
	  });
	  const resp = await viewsModel.deleteMany({ table: dataSourceID });
	  console.log(resp);
	  if (res.acknowledged === false) {
		throw new Error("Deletion unsuccessful or incorrect amount");
	  }
  
	  // DELETE FROM LIST OF DATA SOURCES IN APP
	  const app = await appModel.findOne({ _id: appId });
	  console.log(app.dataSources);
	  console.log(app.dataSources.indexOf(dataSourceID));
	  let index = app.dataSources.indexOf(dataSourceID);
	  if (index === -1) {
		throw new Error("Data source not found in app");
	  }
	  app.dataSources.splice(index, 1);
	  console.log(app.dataSources);
  
	  // DELETE REMOVED VIEWS FROM LIST OF VIEWS IN APP
	  console.log(app.views);
	  views.forEach((v) => {
		let index = app.views.indexOf(v._id);
		console.log(index);
		app.views.splice(index, 1);
	  });
	  console.log(app.views);
  
	  let update = await appModel.findOneAndUpdate(
		{ _id: appId },
		{ dataSources: app.dataSources },
		{ new: true }
	  );
	  update = await appModel.findOneAndUpdate(
		{ _id: appId },
		{ views: app.views },
		{ new: true }
	  );
  
	// FIND AND UPDATE DATA SOURCES REFERENCING THE DELETED DATA SOURCE
	const dataSourcesToUpdate = await dataSourceModel.find({ "columns.dataSourceReference": dataSourceID });

	for (const dataSource of dataSourcesToUpdate) {
		dataSource.columns.forEach((column) => {
		if (column.dataSourceReference && column.dataSourceReference.toString() === dataSourceID) {
			column.dataSourceReference = null;
			column.columnReference = null;
			column.label = false;
		}});
		await dataSource.save();}
	  // Write to the log file
	  await logFile(appId, dataSourceID + " data source removed");
	  res.send(update);
	} catch (err) {
	  console.log("Error: ", err);
	  await logFile(appId, "Error in removing data source " + dataSourceID);
	  res.status(400).json({ message: `Error in data source deletion for ${dataSourceID}` });
	}
  });
    
router.post("/setInitialValue", async (req, res) => {
	// De-struct the payload that was sent
	const { appID, dataSourceID, columnID, value } = req.body;
	// Find the datasource that matched the ID of the request
	try {
	  // Find the data source object by ID
	  const dataSource = await dataSourceModel.findById(dataSourceID);
  
	  // Find the index of the column with the given ID in the columns array
	  const columnIndex = dataSource.columns.findIndex(
		(column) => column._id.toString() === columnID
	  );
  
	  // Update the initial value of the column at the specified index
	  dataSource.columns[columnIndex].initialValue = value;
  
	  // Save the updated data source object
	  const updatedDataSource = await dataSource.save();

	 // Write to the log file
	  const logMessage = `Initial value of column with ID ${columnID} in data source with ID ${dataSourceID} updated to ${value}`
  	  await logFile(appID, logMessage);

	  // Send the updated data source object as the response
	  res.status(200).json(updatedDataSource);
	} catch (error) {
	    // Write to the log file
		const logMessage = `Error updating initial value of column with ID ${columnID} in data source with ID ${dataSourceID}: ${error.message}`
	    await logFile(dataSourceID, logMessage);
	  	// Send an error response if an error occurred
		res.status(500).send(logMessage);
	}
});

router.post("/setLabel", async (req, res) => {
	const { appID, dataSourceID, columnID, value } = req.body;
	try {
	  const dataSource = await dataSourceModel.findById(dataSourceID);
  
	  const columnIndex = dataSource.columns.findIndex((column) => column._id.toString() === columnID);
	  dataSource.columns[columnIndex].label = value;
  
	  if (!value) {
		const referencingDataSources = await dataSourceModel.find({ "columns.columnReference": columnID });
  
		for (const referencingDataSource of referencingDataSources) {
		  const referencingColumnIndex = referencingDataSource.columns.findIndex(
			(column) => column.columnReference && column.columnReference.toString() === columnID
		  );
  
		  if (referencingColumnIndex !== -1) {
			referencingDataSource.columns[referencingColumnIndex].columnReference = null;
			await referencingDataSource.save();
		  }
		}
	  }
  
	  const updatedDataSource = await dataSource.save();
  
	  const content = `Label value of column with ID ${columnID} in data source with ID ${dataSourceID} set to ${value}`;
	  await logFile(appID, content);
  
	  res.status(200).json(updatedDataSource);
	} catch (error) {
	  const logMessage = `Error updating label value of column with ID ${columnID} in data source with ID ${dataSourceID}: ${error.message}`;
	  await logFile(appID, logMessage);
  
	  res.status(500).send(logMessage);
	}
});
  
router.post("/setDataSourceRef", async (req, res) => {
	// Destructure the payload that was sent
	const { appID, dataSourceID, columnID, dataSourceRefValue } = req.body;
  
	try {
	  // Find the data source object by ID
	  const dataSource = await dataSourceModel.findById(dataSourceID);
	
	  console.log("The Data Source we're working with is: ", dataSource);
	  // Find the index of the column with the given ID in the columns array
	  const columnIndex = dataSource.columns.findIndex(column => column._id.toString() === columnID);
		
	  // Handle the case when the user changes the referenced data source
	  if (dataSource.columns[columnIndex].dataSourceReference && dataSourceRefValue !== null && dataSource.columns[columnIndex].dataSourceReference.toString() !== dataSourceRefValue.toString()) {
		console.log('Handling the case when the user changes the referenced data source');
		// Find the old data source and column that was previously being referenced
		const oldDataSourceRef = await dataSourceModel.findById(dataSource.columns[columnIndex].dataSourceReference);
		const oldColumnID = dataSource.columns[columnIndex].columnReference;
  
		if (oldColumnID) {
		  const oldColumnIndex = oldDataSourceRef.columns.findIndex(column => column._id.toString() === oldColumnID.toString());
		  if (oldColumnIndex !== -1) {
			// Set the label of the old column to false since it is no longer being referenced
			oldDataSourceRef.columns[oldColumnIndex].label = false;
			console.log(oldDataSourceRef.columns[oldColumnIndex])
			await oldDataSourceRef.save();
		  }
		}
	  }
	  
	  // Update the data source reference value of the column at the specified index
	  dataSource.columns[columnIndex].dataSourceReference = dataSourceRefValue;
	  if (dataSourceRefValue === null) {
		// Set the column reference value to null if the data source reference value is null
		dataSource.columns[columnIndex].columnReference = null;
	  }
	
	  // Save the updated data source object
	  const updatedDataSource = await dataSource.save();
	
	  // Write to the log file
	  console.log('Writing to the log file');
	  const logMessage = `Data source reference updated for column with ID ${columnID} in data source with ID ${dataSourceID}`;
	  await logFile(appID, logMessage);
	
	  // Send the updated data source object as the response
	  console.log('Sending the updated data source object as the response');
	  res.status(200).json(updatedDataSource);
	} catch (error) {
	  // Write to the log file
	  console.log('Error updating data source reference');
	  const logMessage = `Error updating data source reference of column with ID ${columnID} in data source with ID ${dataSourceID}: ${error.message}`;
	  await logFile(appID, logMessage);
	
	  // Send an error response if an error occurred
	  console.log('Sending an error response if an error occurred');
	  res.status(500).send(logMessage);
	}
});
  
router.post("/setColumnRef", async (req, res) => {
	// Extract the request body parameters
	const { appID, dataSourceID, columnID, columnRefValue } = req.body;
	
	try {
	  // Find the data source object by ID
	  const dataSource = await dataSourceModel.findById(dataSourceID);
	
	  // Find the index of the column with the given ID in the columns array
	  const columnIndex = dataSource.columns.findIndex(
		(column) => column._id.toString() === columnID
	  );
	
	  // Get the old column reference
	  const oldColumnRef = dataSource.columns[columnIndex].columnReference;
	
	  // If the old column reference exists
	  if (oldColumnRef) {
		// Find the data source containing the old column reference
		const oldDataSource = await dataSourceModel.findOne({ "columns._id": oldColumnRef });
	
		// Find the index of the old column reference in the old data source
		const oldColumnIndex = oldDataSource.columns.findIndex((column) => column._id.toString() === oldColumnRef.toString());
	
		// Unset the label attribute for the old reference column
		oldDataSource.columns[oldColumnIndex].label = false;
		await oldDataSource.save();
	  }
	
	  // Update the columnReference value of the column at the specified index
	  dataSource.columns[columnIndex].columnReference = columnRefValue;
	
	  // If the new column reference value is provided
	  if (columnRefValue) {
		// Find the data source containing the new column reference
		const newDataSource = await dataSourceModel.findOne({ "columns._id": columnRefValue });
	
		// Find the index of the new column reference in the new data source
		const newColumnIndex = newDataSource.columns.findIndex((column) => column._id.toString() === columnRefValue.toString());
	
		// Set the label attribute of the new reference column to true
		newDataSource.columns[newColumnIndex].label = true;
		await newDataSource.save();
	  }
	
	  // Save the updated data source object
	  const updatedDataSource = await dataSource.save();
	
	  // If the new column reference value is null
	  if (columnRefValue === null) {
		// Set the column reference value to null
		dataSource.columns[columnIndex].columnReference = null;
	  }
	
	  // Write to the log file
	  const logMessage = `Data source reference of column with ID ${columnID} in data source with ID ${dataSourceID} updated to ${columnRefValue}`;
	  await logFile(appID, logMessage);
	
	  // Send the updated data source object as the response
	  res.status(200).json(updatedDataSource);
	} catch (error) {
	  console.log("Error in /setColumnRef route:", error);
	
	  // Write to the log file
	  const logMessage = `Error updating data source reference of column with ID ${columnID} in data source with ID ${dataSourceID}: ${error.message}`;
	  await logFile(appID, logMessage);
	
	  // Send an error response if an error occurred
	  res.status(500).send(logMessage);
	}
});

async function logFile(appId, content){
	const folderPath = './log-files';
	const filePath = `${folderPath}/${appId}.txt`;
	content = new Date() + ": " + content + '\n';
	
	try {
	  // Check if the folder exists
	  if (!fs.existsSync(folderPath)) {
		// If it doesn't exist, create it
		await fs.mkdirSync(folderPath);
	  }
  
	  // Check if the file exists
	  if (!fs.existsSync(filePath)) {
		// If it doesn't exist, create it and write the content
		await fs.writeFileSync(filePath, content);
	  } else {
		// If it exists, append the content
		await fs.appendFileSync(filePath, content);
	  }
	  console.log('Log File updated successfully.');
	} catch (err) {
	  console.error(err);
	}
}
module.exports = router;