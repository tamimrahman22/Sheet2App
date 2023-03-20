var express = require('express');
var router = express.Router();
const appModel = require('../models/Apps');

router.post('/create', async(req, res) => {
    const { name, creator, roles, roleMembershipSheet } = req.body;
	console.log(req.body);
    try {
		const newApp = await appModel.create({
			name: name,
			creator: creator,
			roleMembershipSheet: roleMembershipSheet,
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


module.exports = router;