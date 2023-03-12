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
	// dataSources: [
	// 	{
	// 		type: Schema.Types.ObjectId,
	// 		ref: 'Table',
	// 	},
	// ],
	// views: [
	// 	{
	// 		type: Schema.Types.ObjectId,
	// 		ref: 'View',
	// 	},
	// ],
	roleMembershipSheet: {
		type: String,
		required: true,
	},
	published: {
		type: Boolean,
		default: false,
	}
});

const App = mongoose.model("App", userSchema);
module.exports = App;