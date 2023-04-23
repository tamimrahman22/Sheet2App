const mongoose = require('mongoose');
const viewSchema = new mongoose.Schema({
	// name of application for which the view is being created
	name: {
		type: String,
		required: true,
	},
	// data source from where values are being referenced
	table: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'DataSource',
		required: true,
	},
	// columns from data source
	columns: {
		type: [String],
	},
	// detailed or table view
	viewType: {
		type: String,
		required: true,
	},
	// allowed actions, different based on which view. add record for table view, edit record for detail view
	allowedActions: {
		type: [String],
		required: true,
	},
	// roles associated with the application (developer vs. end user)
	roles: {
		type: [String],
	},
	// only include records with this fulture
	filter: {
		type: [Boolean],
	},
	// filter for email address
	userFilter: {
		type: [String],
	},
	// edit record filter
	editFilter: {
		type: [Boolean],
	},
	// columns that are editable
	editable: {
		type: [String],
	},
}, { timestamps: true });

const View = mongoose.model("View", viewSchema);
module.exports = View;