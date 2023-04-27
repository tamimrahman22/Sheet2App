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
    const { appId, tableId, viewType, columns, actions, roles } = req.body;
    try{
        // get necessary information for views
        const currentApp = await appModel.findById( { _id: appId } );
        const table = await dataSourceModel.findById( { _id: tableId });
        console.log(currentApp);
        console.log(table)
        const name = currentApp.name;

        // create a view
        let newView = null;

        if (viewType === "Table") {
            newView = await viewsModel.create({
                name: "New View",
                table: tableId,
                columns: columns,
                viewType: viewType,
                allowedActions: actions,
                roles: roles
            });
        }
        else if (viewType === "Detail") {
            newView = await viewsModel.create({
                name: "New View",
                table: tableId,
                viewType: viewType,
                allowedActions: actions,
                roles: roles,
                editable: columns,
            });
        }

        // add views to the respective application
        let currentViews = currentApp.views;
        currentViews.push(newView);
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

    const columns = table.columns;
    // console.log(columns);

    // TYPE CHECKING, check for number, boolean or url, otherwise it is a string
    let check = true;
    let urlRegex = /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
    for(let i = 0; i < columns.length; i++){
        // console.log(columns[i]);
        console.log(typeof record[i]);
        if(!isNaN(record[i])){
            if(columns[i].type !== 'number'){
                check = false;
            }
        }
        else if(typeof record[i] === 'boolean' || record[i] == 'FALSE' || record[i] == 'TRUE' || record[i] == 'false' || record[i] == 'true'){
            if(columns[i].type !== 'boolean'){
                check = false;
            }
        }
        else if(urlRegex.test(record[i])) {
            if(columns[i].type !== 'url'){
                check = false;
            }
        }
    }

    console.log(spreadsheetId);
    console.log(range);
    console.log.apply(resource);

    if(check == true){
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
    }
    else{
        console.log('Wrong type');
        res.status(400).json({ message: `Error in adding record: wrong type` });
    }
    
});

router.post('/editRecord', async (req, res) => {
    // get dataSource
    const { oldRecord, newRecord, tableId } = req.body;
    const authClientObject = await auth.getClient();
	const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
    const table = await dataSourceModel.findById( { _id: tableId });

    const regex = /\/d\/(.*?)\/edit/;
    const match = table.url.match(regex);
    const spreadsheetId = match[1]; // this will give you the characters between /d/ and /edit/
    let range = table.sheetName;
    let sheetName = table.sheetName;

    const columns = table.columns;
    // console.log(columns);

    // TYPE CHECKING, check for number, boolean or url, otherwise it is a string
    let check = true;
    let urlRegex = /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
    for(let i = 0; i < columns.length; i++){
        // console.log(columns[i]);
        console.log(typeof newRecord[i]);
        if(!isNaN(newRecord[i])){
            if(columns[i].type !== 'number'){
                check = false;
            }
        }
        else if(typeof newRecord[i] === 'boolean' || newRecord[i] == 'FALSE' || newRecord[i] == 'TRUE' || newRecord[i] == 'false' || newRecord[i] == 'true'){
            if(columns[i].type !== 'boolean'){
                check = false;
            }
        }
        else if(urlRegex.test(newRecord[i])) {
            if(columns[i].type !== 'url'){
                check = false;
            }
        }
    }

    if(check == false){
        console.log('Wrong type');
        res.status(400).json({ message: `Error in editing record: wrong type` });
    }
    else{
        const response = await googleSheetsInstance.spreadsheets.get({
			spreadsheetId,
			auth,
		});

		const readData = await googleSheetsInstance.spreadsheets.values.get({
			auth, //auth object
			spreadsheetId, // spreadsheet id
			range, //range of cells to read from.
		})


        await googleSheetsInstance.spreadsheets.values.clear({
            spreadsheetId,
            range: `${sheetName}!A2:ZZ`,
        })
        

        for(let i = 1; i < readData.data.values.length; i++){
            if(readData.data.values[i][0] === oldRecord[0]){
                let values = [];
                values.push(newRecord);
                const resource = { values };
                await googleSheetsInstance.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: "USER_ENTERED",
                    resource,
                });
            }
            else{
                let values = [];
                values.push(readData.data.values[i]);
                const resource = { values };
                await googleSheetsInstance.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: "USER_ENTERED",
                    resource,
                });
            }
        }

        res.status(200).json({ tableId: tableId });
    }

})


router.post("/deleteRecord", async (req, res) => {
    const { record, viewId, tableId } = req.body;
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

        // Find specific view and remove detail view if necessary
        const view = await viewsModel.findById({ _id: viewId });
        const details = view.details.filter(v => !compareArrays(v, record));

        // Update that view with removed detail view
        await viewsModel.findByIdAndUpdate(
            { _id: viewId },
            { details: details },
        )

        // Update all views that use the data source
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

router.post("/setColumns", async(req, res) => {
    const { viewId, viewType, columns } = req.body;
    try {
        if (viewType === "Table") {
            const updatedView = await viewsModel.findOneAndUpdate(
                { _id: viewId },
                { columns: columns },
                { new: true }
            )
            res.send(updatedView);
        }
        else if (viewType === "Detail") {
            const updatedView = await viewsModel.findOneAndUpdate(
                { _id: viewId },
                { editable: columns },
                { new: true }
            )
            res.send(updatedView);
        }
        else {
            res.status(400).json({ message: `Invalid view type of ${viewType} given!` });
        }
    }
    catch (err) {
        console.error('Error: ', err);
		res.status(400).json({ message: `Error in setting up columns for ${viewId}` });
    }
});

router.post("/setActions", async(req, res) => {
    const { viewId, actions } = req.body;
    try {
        const updatedView = await viewsModel.findOneAndUpdate(
            { _id: viewId },
            { allowedActions: actions },
            { new: true }
        )
        res.send(updatedView);
    }
    catch (err) {
		console.error('Error: ', err);
		res.status(400).json({ message: `Error in setting up role for ${viewId}` });
	}
})

module.exports = router;