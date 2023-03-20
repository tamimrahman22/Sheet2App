var express = require('express');
var router = express.Router();
const App = require('../models/Apps');

router.post('/create', async(req, res) => {
    const { name, creator, roles, roleMembershipSheet } = req.body;
	console.log(req.body);
    try {
		const newApp = await App.create({
			name: name,
			creator: creator,
			roleMembershipSheet: roleMembershipSheet,
		});
        console.log(newApp);
		res.status(201).json({ message: `${name} app created` });
    }
    catch (error) {
		console.error('Error: ', error);
		res.status(500).json({ message: `Error in app creation for app ${name}` });
	}
});

module.exports = router;