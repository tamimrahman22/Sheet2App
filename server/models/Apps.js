const mongoose = require('mongoose');
const appSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	creator: {
		type: String,
		required: true,
	},
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
	}
});

const App = mongoose.model("App", appSchema);
module.exports = App;