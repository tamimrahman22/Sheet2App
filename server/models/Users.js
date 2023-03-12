const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	apps: [
		{
			type: Schema.Types.ObjectId,
			ref: 'App',
		},
	],
	// views: [
	// 	{
	// 		type: Schema.Types.ObjectId,
	// 		ref: 'View',
	// 	},
	// ],
});

const User = mongoose.model("User", userSchema);
module.exports = User;