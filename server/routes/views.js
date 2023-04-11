var express = require('express');
var router = express.Router();
const appModel = require('../models/Apps');
const dataSourceModel = require('../models/DataSource');
const viewsModel = require('../models/View');

const { google } = require("googleapis");
const auth = new google.auth.GoogleAuth({
	// keyFile: "./keys.json",
	keyFile: "keys.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
});

router.post('/add', async (req, res) => {
    // get name, table, columns, and roles from appId, 
    const { appId, tableId, viewType, columns } = req.body;
    console.log(columns);
    try{
        // get necessary information for views
        const currentApp = await appModel.findById( { _id: appId } );
        const table = await dataSourceModel.findById( { _id: tableId });
        console.log(currentApp);
        console.log(table)
        const name = currentApp.name;
        const allowedActions = [];

        // add the proper allowed actions based on the viewType
        if(viewType == 'Table'){
            allowedActions.push('addRecord');
        }
        else{
            allowedActions.push('editRecord');
        }

        // create a view
        const newViews = await viewsModel.create({
            name: "New View",
            table: tableId,
            columns: columns,
            viewType: viewType,
            allowedActions: allowedActions,
        });

        // add views to the respective application
        let currentViews = currentApp.views;
        currentViews.push(newViews);
        const updatedApp = await appModel.findOneAndUpdate(
            { _id: appId },
            {views: currentViews},
            {new: true}
        );

        res.send(updatedApp);
    }
    catch(err) {
        console.error('Error: ', err);
		res.status(400).json({ message: `Error in view creation for app` });
    }

});

router.get('/list', async(req, res) => {
    // get list of all views
	try {
		const list = await viewsModel.find({ });
		console.log(list);
		res.send(list);
	}
	catch (err) {
		console.error('Error: ', error);
		res.status(400).json({ message: `Error in getting apps` });
	}
});

router.get('/get/:id', async(req, res) => {
	// get application
	try {
		const currentApp = await appModel.findById(req.params.id);
		let finalList = [];
		for(let i = 0; i < currentApp.views.length; i++){
			finalList.push(await viewsModel.findById({ _id: currentApp.views[i] }));
		}
		console.log(finalList);
		res.send(finalList);
	}
	catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in getting app` });
	}
});

router.post("/rename", async(req, res) => {
    // update name of a view
    const {name, viewId} = req.body;
    try {
        const updatedView = await viewsModel.findOneAndUpdate(
            { _id: viewId },
            { name: name }
        );
        res.send(updatedView);
    }
    catch (err) {
        console.error('Error: ', err);
        res.status(400).json({ message: `Error in renaming the view!`});
    }
})

router.post('/delete', async(req, res) => {
    const { appId, viewId } = req.body;
    try {
        // DELETE FROM THE VIEWS COLLECTION
        const view = await viewsModel.deleteOne({ _id: viewId });
        console.log(view);
        if (view.deletedCount != 1) {
            throw new Error("Deletion unsuccessful or incorrect amount")
        }
 
        // DELETE FROM THE LIST OF VIEWS IN APP
        const app = await appModel.findOne({ _id: appId });
        console.log(app.views);
        console.log(app.views.indexOf(viewId));
        let index = app.views.indexOf(viewId);
        if (index === -1) {
            throw new Error("View not found in app");
        }
        app.views.splice(index, 1);
        console.log(app.views);

        const update = await appModel.findOneAndUpdate(
            { _id: appId },
            { views: app.views },
            { new: true },
        );
        res.send(update);
    }
    catch (err) {
        console.error('Error: ', err);
        res.status(400).json({ message: `Error in view deletion for view ${viewId}` });
    }
})

router.post('/addRecord', async (req, res) => {
    // get dataSource
    const { record, tableId } = req.body;
    const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
    const table = await dataSourceModel.findById( { _id: tableId });

    const regex = /\/d\/(.*?)\/edit/;
    const match = table.url.match(regex);
    const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/
    const range = table.sheetName;
    const values = [];
    values.push(record);
    const resource = { values };

    console.log(spreadsheetId);
    console.log(range);
    console.log.apply(resource);

    // add record to datasource
    try {
        const writeData = googleSheetsInstance.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            resource,
        });
      console.log("successfully wrote to sheet");

    await viewsModel.updateMany(
        { table: tableId },
        { updatedAt: Date.now() },
    );
      res.status(200).json({ tableId: tableId });
    }
    catch (err){
        console.error('Error: ', err);
		res.status(400).json({ message: `Error in adding record` });
    }
});

router.post("/deleteRecord", async (req, res) => {
    const { record, tableId } = req.body;
    const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
    const table = await dataSourceModel.findById( { _id: tableId });

    const regex = /\/d\/(.*?)\/edit/;
    const match = table.url.match(regex);
    const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/
    const range = table.sheetName;

    try {
        // Get previous data and remove the selected record
        const response = await googleSheetsInstance.spreadsheets.values.get({
            spreadsheetId,
            range: range,
        });
        const rows = response.data.values;
        const values = rows.filter(row => !record.includes(row[0]));
        console.log(values);
        const resource = { values };

        // Clear the spreadsheet data
        await googleSheetsInstance.spreadsheets.values.clear({
            spreadsheetId,
            range: range,
        })

        // Insert all the data
        const updateRequest = {
            spreadsheetId,
            range: range,
            valueInputOption: "USER_ENTERED",
            resource,
        }
        await googleSheetsInstance.spreadsheets.values.update(updateRequest)
        console.log(`Deleted rows with values: ${record}`);

        await viewsModel.updateMany(
            { table: tableId },
            { updatedAt: Date.now() },
        );
        res.status(200).json({ tableId: tableId });
    }
    catch(err) {
        console.error('Error: ', err);
		res.status(400).json({ message: `Error in deleting ${record}` });
    }
})

router.post("/setRoles", async(req, res) => {
    const { viewId, roles } = req.body;
    try {
        const updatedView = await viewsModel.findOneAndUpdate(
            { _id: viewId },
            { roles: roles },
            { new: true }
        )
        res.send(updatedView);
    }
    catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in setting up role for ${viewId}` });
	}
});

router.post("/addDetailView", async(req, res) => {
    const { viewId, row } = req.body;
    try {
        const currentView = await viewsModel.findOne({ _id: viewId });
        console.log(currentView);
        let details = currentView.details
        details.push(row);
        const updatedView = await viewsModel.findOneAndUpdate(
            { _id: viewId },
            { details: details },
            { new: true }
        );
        res.send(updatedView);
    }
    catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in creating a detail view for the record ${row} in ${viewId}` });
	}
})

module.exports = router;