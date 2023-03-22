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
	// array of dataSource object ids, can be referenced in dataSource collection
	dataSources: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'DataSource',
		},
	],
	// array of view object ids, can be referenced in views collection
	views: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'View',
		},
	],
	// url with roles for users for this application
	roleMembershipSheet: {
		type: String,
		required: true,
	},
	// if app is published for end-user
	published: {
		type: Boolean,
		default: false,
	},
	// roles, developer or end-user, get from roleMembershipSheet
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