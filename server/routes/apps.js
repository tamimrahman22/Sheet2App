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

router.get('/test', async(req, res) => {
	return res.status(200).send("Testing 1 2 3");
})

// route to create application, broken up into two routes, this one (/app/create) and a datasource route (/datasource/add)
// first route is used to create application and add roles, second route is used to add datasource tables
router.post('/create', async (req, res) => {
	const { name, creator, roleMembershipSheet } = req.body;
  
	if (!name) {
		console.log("Error: No name was given!")
	  	return res.status(400).json({ message: 'App name cannot be empty.' });
	}
  
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
		range: `Sheet1`, //range of cells to read from.
	  });
  
	  if (!readData || !readData.data || !readData.data.values || readData.data.values.length < 2) {
		console.error('Error: No roles are given in the sheet!');
		return res.status(400).json({ message: 'Role membership sheet should have at least one role.' });
	  }
  
	  // get each column and put into array
	  console.log(readData.data.values);
	  for (let i = 0; i < readData.data.values[0].length; i++) {
		let tempList = [];
		for (let j = 0; j < readData.data.values.length; j++) {
		  if (readData.data.values[j][i] != undefined)
			tempList.push(readData.data.values[j][i]);
		}
		roleName = tempList.shift();
		roles.push({
		  name: roleName,
		  users: tempList,
		  allowedActions: []
		});
	  }
	} catch (error) {
	  console.error('Error: ', error);
	  return res.status(400).json({ message: `Error in reading membership sheet information for app ${name}.` });
	}

	// create new app with payload and roles that were acquired in previous block
	try {
	  const newApp = await appModel.create({
		name: name,
		creator: creator,
		roleMembershipSheet: roleMembershipSheet,
		roles: roles
	  });
	  // res.status(201).json({ message: `${name} app created` });
	  await logFile(newApp.id, name + " app created");
	  res.send(newApp);
	} catch (error) {
	  console.error('Error: ', error);
	  res.status(400).json({ message: `Error in app creation for app ${name}.` });
	}
});

router.post('/delete', async(req, res) => {
	const { appId } = req.body;
	try{
		const app = await appModel.findById({ _id: appId });
		console.log(app.dataSources);
		const result = await appModel.deleteOne({ _id: appId });
		console.log(app.dataSources);
		const result2 = await dataSourceModel.deleteMany({ _id: { $in: app.dataSources } });
		const result3 = await viewsModel.deleteMany({ _id: { $in: app.views } });

		console.log('Record deleted successfully');
		console.log(result);
		console.log(result2);
		console.log(result3);
		await logFile(appId, app.name + " app deleted");
		res.send(result);
	}
	catch (error) {
		console.error('Error: ', error);
		await logFile(appId, "Error in deleting app ");
		res.status(400).json({ message: `Error in app deletion for app ${appId}` });
	}	
});

router.post('/list', async(req, res) => {
	// list all applications
	await updateAppRoles();
	const { user } = req.body;
	try {
		const list = await appModel.find({ });
		let finalList = [];
		for (let i = 0; i < list.length; i++) {
			if(list[i].creator == user){
				finalList.push(list[i]);
			}
			else{
				for (let j = 0; j < list[i].roles.length; j++) {
					if (list[i].roles[j].users.includes(user)) {
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
	console.log();
	try {
		const currentApp = await appModel.findById(req.params.id);
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
	await updateAppRoles();

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
		
		const currentApp = await appModel.findById( { _id: appId } );
		console.log(currentApp.published);
		let newPublished = !currentApp.published;
		const updatedApp = await appModel.findOneAndUpdate(
			{ _id: appId },
			{ published: newPublished },
			{ new: true },
		);
		await logFile(appId, updatedApp.name + " " + newPublished);
		res.send(updatedApp);
	}
	catch (err) {
		console.error('Error: ', err);
		await logFile(appId, "Error in publishing/unpublishing");
		res.status(400).json({ message: `Error in publishing app` });
	}
});

router.post("/rename", async(req, res) => {
	// update the name of an application
	const {appId, newName} = req.body;
	try {
		const updatedApp = await appModel.findOneAndUpdate(
			{ _id: appId },
			{ name: newName },
			{ new: true },
		);
		res.send(updatedApp);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in renaming app` });
	}
});

router.post("/setRoles", async(req, res) => {
	const { appId, role, actions } = req.body;
	try {
		const app = await appModel.findById(appId);
		let roles = app.roles;
		for (let i = 0; i < roles.length; i++) {
			if (roles[i].name === role.name) {
				console.log(roles[i])
				roles[i].allowedActions = actions;
			}
		}
		const updatedApp = await appModel.findOneAndUpdate(
			{ _id: appId },
			{ roles: roles },
			{ new: true }
		);
		res.send(updatedApp);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in editing ${role.name} allowed actions` });
	}
})

router.post("/test", async(req, res) => {
	logFile("dsafdsaf", "First log");
	return res.status(200).send("Testing 1 2 3");
});

async function updateAppRoles(){
	const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
	const list = await appModel.find({ });
	try{
		for(let i = 0; i < list.length; i++){
			// get name of sheet
			const url = list[i].roleMembershipSheet;
			const regex = /\/d\/(.*?)\/edit/;
			const match = url.match(regex);
			const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/

			const readData = await googleSheetsInstance.spreadsheets.values.get({
				auth, //auth object
				spreadsheetId, // spreadsheet id
				range: `Sheet1`, //range of cells to read from.
			})
	
			// get each column and put into array
			let roles = [];

			for(let k = 0; k < readData.data.values[0].length; k++){
				let tempList = [];
				for(let j = 0; j < readData.data.values.length; j++){
					if (readData.data.values[j][k] != undefined)
						tempList.push(readData.data.values[j][k]);
				}
				roleName = tempList.shift();
				for (let l = 0; l < list[i].roles.length; l++) {
					if (list[i].roles[l].name === roleName) {
						actions = list[i].roles[l].allowedActions;
						break;
					}
				}

				roles.push({
					name: roleName,
					users: tempList,
					allowedActions: []
				});
			}
			console.log(list[i].name);
			console.log(roles);
			const updatedApp = await appModel.findOneAndUpdate(
				{ _id: list[i].id },
				{roles: roles},
			);
		}
		// console.log(finalList);
		console.log("App roles updated");
	}
	catch (err) {
		console.error('Error in updating app roles: ', err);
	}
}

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