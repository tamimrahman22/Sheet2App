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
        const currentApp = await appModel.findById( { _id: appId } );
        const table = await dataSourceModel.findById( { _id: tableId });
        console.log(currentApp);
        console.log(table)
        const name = currentApp.name;
        const columns = table.columns;
        const allowedActions = [];
        const roles = currentApp.roles;

        if(viewType == 'Table'){
            allowedActions.push('addRecord');
        }
        else{
            allowedActions.push('editRecord');
        }
        const newViews = await viewsModel.create({
            name: name,
            table: tableId,
            columns: columns,
            viewType: viewType,
            allowedActions: allowedActions,
            roles: roles
        });

        res.send(currentApp);
    }
    catch(err) {
        console.error('Error: ', err);
		res.status(400).json({ message: `Error in view creation for app` });
    }

});

router.get('/list', async(req, res) => {
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

module.exports = router;