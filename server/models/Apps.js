const mongoose = require('mongoose');
const appSchema = new mongoose.Schema({
	// name of application
	name: {
		type: String,
		required: true,
	},
	// creator of application, logged in user
	creator: {
		type: String,
		required: true,
	},
	// array of dataSource object ids, can be found in dataSource schema
	dataSources: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'DataSource',
		},
	],
	
	views: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'View',
		},
	],
	roleMembershipSheet: {
		type: String,
		required: true,
	},
	published: {
		type: Boolean,
		default: false,
	},
	roles: [
		{
			name: {
				type: String,
				required: true
			},
			role: {
				type: String,
				required: true
			}
		}
	]
});

const App = mongoose.model("App", appSchema);
module.exports = App;