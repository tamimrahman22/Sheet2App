const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
	// email of logged in user, get from store
	email: {
		type: String,
		required: true
	},
	// apps associated with user
	apps: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'App',
		},
	],
	// views associated with user
	views: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'View',
		},
	],
});

const User = mongoose.model("User", userSchema);
module.exports = User;