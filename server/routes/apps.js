var express = require('express');
var router = express.Router();
const appModel = require('../models/Apps');
// const dataSourceModel = require('../models/DataSource');
const { google } = require("googleapis");

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

router.post('/publish', async(req, res) => {
	const { appId } = req.body;
	try {
		const updatedApp = await appModel.findOneAndUpdate(
			{ _id: appId },
			{ published: true },
		);
		res.send(updatedApp);
	}
	catch (err) {
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in publishing app` });
	}
});

router.post('/unpublish', async(req, res) => {
	const { appId } = req.body;
	try {
		const updatedApp = await appModel.findOneAndUpdate(
			{ _id: appId },
			{ published: false },
		);
		res.send(updatedApp);
	}
	catch (err) {
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in unpublishing app` });
	}
});


module.exports = router;