var express = require('express');
var router = express.Router();
const appModel = require('../models/Apps');
const dataSourceModel = require('../models/Datasource');
const { google } = require("googleapis");
// const keys = require("../keys.json");

// const auth = new google.auth.GoogleAuth({
// 	keyFile: "./keys.json",
// 	scopes: "https://www.googleapis.com/auth/spreadsheets"
// });
const auth = new google.auth.GoogleAuth({
	// keyFile: "./keys.json",
	keyFile: "keys.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
});

router.post('/create', async(req, res) => {
    const { name, creator, roleMembershipSheet } = req.body;
	const roles = [];

	// get all roles
	const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

	try {
		const regex = /\/d\/(.*?)\/edit/;
		const match = roleMembershipSheet.match(regex);
		const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/
		// console.log(result);
		// const spreadsheetId = "1K1RoF5WRKtu_UDOVMTAMlr_tfCGv0rTi3qQBIwRCvrY"


		const readData = await googleSheetsInstance.spreadsheets.values.get({
			auth, //auth object
			spreadsheetId, // spreadsheet id
			range: "Sheet1!A:B", //range of cells to read from.
		})

		for(let i = 1; i < readData.data.values.length; i++){
			roles.push({
				name: readData.data.values[i][0],
				role: readData.data.values[i][1]
			})
		};

		console.log(roles);
	}
	catch (error){
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in reading membership sheet information for app ${name}` });
	}
	
	console.log(req.body);

	// create new app
    try {
		const newApp = await appModel.create({
			name: name,
			creator: creator,
			roleMembershipSheet: roleMembershipSheet,
			roles: roles
		});
        console.log(newApp);
		// res.status(201).json({ message: `${name} app created` });
		res.send(newApp);
    }
    catch (error) {
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in app creation for app ${name}` });
	}
});

router.post('/addDataSource', async (req, res) => {
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
				
				const updatedUser = await dataSourceModel.findOneAndUpdate(
					{ _id: referenceId },
					{"columns": columns},
				);
				console.log(updatedUser);
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

router.get('/list', async(req, res) => {
	try {
		const list = await appModel.find({ });
		console.log(list);
		res.send(list);
	}
	catch (err) {
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in getting apps` });
	}
});

router.post('/updateSheet', async(req, res) => {
	// FOR UPDATE SHEET PAYLOAD:
	// need appID (spreadsheet id from app), sheetid, range for cell, and cell values
	const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
	const spreadsheetId = "15vZfVPQlX5GhL0Ome0NZCPXBDPVc14XNsSEg_tNyXUc"

	const readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: "Sheet1!A:B", //range of cells to read from.
    })

    //send the data read with the response
	res.send(readData.data)
    // res.send(readData.data.values[0][0])
});


module.exports = router;