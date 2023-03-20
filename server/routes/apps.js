var express = require('express');
var router = express.Router();
const appModel = require('../models/Apps');
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
	const spreadsheetId = "1K1RoF5WRKtu_UDOVMTAMlr_tfCGv0rTi3qQBIwRCvrY"


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
		res.status(201).json({ message: `${name} app created` });
    }
    catch (error) {
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in app creation for app ${name}` });
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