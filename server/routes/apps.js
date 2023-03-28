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

router.get('/test', async(req, res) => {
	return res.status(200).send("Testing 1 2 3");
})

// route to create application, broken up into two routes, this one (/app/create) and a datasource route (/datasource/add)
// first route is used to create application and add roles, second route is used to add datasource tables
router.post('/create', async(req, res) => {
    const { name, creator, roleMembershipSheet } = req.body;
	const roles = [];

	const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

	// get all roles from role membership sheet
	try {
		// regex to get just the spreadsheet id
		const regex = /\/d\/(.*?)\/edit/;
		const match = roleMembershipSheet.match(regex);
		const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/

		// get the values in the role membership sheet
		const readData = await googleSheetsInstance.spreadsheets.values.get({
			auth, //auth object
			spreadsheetId, // spreadsheet id
			range: "Sheet1!A:B", //range of cells to read from.
		})

		// push those values into an array with the email of the user and their role
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
		return res.status(400).json({ message: `Error in reading membership sheet information for app ${name}` });
	}
	
	console.log(req.body);

	// create new app with payload and roles that were acquired in previous block
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

router.post('/delete', async(req, res) => {
	const { appId } = req.body;
	try{
		const result = await appModel.deleteOne({ _id: appId });
		console.log('Record deleted successfully');
		console.log(result);
		res.send(result);
	}
	catch (error) {
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in app deletion for app ${appId}` });
	}	
});

router.post('/list', async(req, res) => {
	// list all applications
	const { user } = req.body;
	try {
		const list = await appModel.find({ });
		let finalList = [];
		for(let i = 0; i < list.length; i++){
			if(list[i].creator == user){
				finalList.push(list[i]);
			}
			else{
				for(let j = 0; j < list[i].roles.length; j++){
					if(list[i].roles[j].name == user && list[i].roles[j].role == 'Developer'){
						finalList.push(list[i]);
					}
				}
			}
		}

		console.log(finalList);
		res.send(finalList);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in getting list of apps based on logged in user` });
	}
});

router.get('/get/:id', async(req, res) => {
	// get application
	try {
		const currentApp = await appModel.find(req.query);
		console.log(currentApp);
		res.send(currentApp);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in getting app` });
	}
});

router.post('/published-end-user', async(req, res) => {
	// list all published applications where current user is end user
	// need user
	const { user } = req.body;
	try {
		const list = await appModel.find({ published: true });
		// console.log(list);
		// res.send(list);
		let finalList = []
		for(let i = 0; i < list.length; i++){
			for(let j = 0; j < list[i].roles.length; j++){
				if(list[i].roles[j].name == user && list[i].roles[j].role == 'End User'){
					finalList.push(list[i]);
				}
			}
		}
		console.log(finalList);
		res.send(finalList);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in getting apps` });
	}
});

router.post('/publish', async(req, res) => {
	// publish an application
	const { appId } = req.body;
	try {
		const updatedApp = await appModel.findOneAndUpdate(
			{ _id: appId },
			{ published: true },
			{ new: true },
		);
		res.send(updatedApp);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in publishing app` });
	}
});

router.post('/unpublish', async(req, res) => {
	// unpublish an application, not available to end user
	const { appId } = req.body;
	try {
		const updatedApp = await appModel.findOneAndUpdate(
			{ _id: appId },
			{ published: false },
			{ new: true },
		);
		res.send(updatedApp);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in unpublishing app` });
	}
});


module.exports = router;