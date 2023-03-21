var express = require('express');
var router = express.Router();
const appModel = require('../models/Apps');
const dataSourceModel = require('../models/DataSource');
const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
	// keyFile: "./keys.json",
	keyFile: "keys.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
});

router.post('/add', async (req, res) => {
	const { appId, url, sheetIndex, keys } = req.body;

	// get all column names
	const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

	try {
		const regex = /\/d\/(.*?)\/edit/;
		const match = url.match(regex);
		const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/
		const response = await googleSheetsInstance.spreadsheets.get({
			spreadsheetId,
			auth,
		});
		for(let i = 0; i < response.data.sheets.length; i++){
			if(response.data.sheets[i].properties.index == sheetIndex){
				let columns = [];
				let name = response.data.sheets[i].properties.title;
				
				// get column names
				const readColumns = await googleSheetsInstance.spreadsheets.values.get({
					auth, //auth object
					spreadsheetId, // spreadsheet id
					range: `${name}!1:1`, //range of cells to read from.
				})

				// get type for each column
				const readData = await googleSheetsInstance.spreadsheets.values.get({
					auth, //auth object
					spreadsheetId, // spreadsheet id
					range: `${name}!2:2`, //range of cells to read from.
					valueRenderOption: 'UNFORMATTED_VALUE',
    				dateTimeRenderOption: 'SERIAL_NUMBER'
				})
				const newDataSource = await dataSourceModel.create({
					name: name,
					url: url,
					sheetIndex: sheetIndex,
					keys: keys,
					// columns: columns
				});
				let columnNames = readColumns.data.values[0];
				let columnFirstValues = readData.data.values[0];

				let referenceId = newDataSource.id;
				for(let j = 0; j < columnNames.length; j++){
					columns.push({
						name: columnNames[j],
						label: false,
						reference: referenceId,
						type: typeof columnFirstValues[j]
					})
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
			}
		}
		console.log(response.data.sheets);
		res.send(response)
		
	}
	catch (error){
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in reading membership sheet information for app ${name}` });
	}
});

module.exports = router;