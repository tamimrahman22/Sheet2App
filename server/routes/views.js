var express = require('express');
var router = express.Router();
const appModel = require('../models/Apps');
const dataSourceModel = require('../models/DataSource');
const viewsModel = require('../models/View');

const { google } = require("googleapis");

router.post('/create', async (req, res) => {
    // get name, table, columns, and roles from appId, 
    const { appId, tableId, viewType } = req.body;
    try{
        // get necessary information for views
        const currentApp = await appModel.findById( { _id: appId } );
        const table = await dataSourceModel.findById( { _id: tableId });
        console.log(currentApp);
        console.log(table)
        const name = currentApp.name;
        const columns = table.columns;
        const allowedActions = [];
        const roles = currentApp.roles;

        // add the proper allowed actions based on the viewType
        if(viewType == 'Table'){
            allowedActions.push('addRecord');
        }
        else{
            allowedActions.push('editRecord');
        }

        // create a view
        const newViews = await viewsModel.create({
            name: name,
            table: tableId,
            columns: columns,
            viewType: viewType,
            allowedActions: allowedActions,
            roles: roles
        });

        // add views to the respective application
        let currentViews = currentApp.views;
        currentViews.push(newViews);
        const updatedApp = await appModel.findOneAndUpdate(
            { _id: appId },
            {views: currentViews},
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


module.exports = router;