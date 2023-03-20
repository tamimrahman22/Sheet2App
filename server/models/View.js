const mongoose = require('mongoose');
const viewSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	table: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'DataSource',
		required: true,
	},
	columns: {
		type: [String],
	},
	viewType: {
		type: String,
		required: true,
	},
	allowedActions: {
		type: [String],
		required: true,
	},
	roles: {
		type: [String],
		required: true,
	},
	filter: {
		type: [Boolean],
	},
	userFilter: {
		type: [String],
	},
	editFilter: {
		type: [Boolean],
	},
	editable: {
		type: [String],
	},
});

const View = mongoose.model("View", viewSchema);
module.exports = View;