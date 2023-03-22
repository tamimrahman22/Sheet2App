const mongoose = require('mongoose');
const dataSourceSchema = new mongoose.Schema({
	// name of Sheet
    name: {
		type: String,
		required: true,
	},
	// location of spreadsheet
	url: {
		type: String,
		required: true,
	},
	// sheet index that is passed in
	sheetIndex: {
		type: Number,
		required: true,
	},
	// unique keys
	keys: [
		{
			type: mongoose.Schema.Types.Mixed,
			required: true,
		}
	],
	// column values that are taken from the spreadsheet's sheet
    columns: [
        {
			// name of column
            name: {
				type: String,
				required: true,
			},
			// initial value of empty cell, optional
			initialValue: {
				type: String,
			},
			// indicates whether column is used as the link text for references to record, set to true for at msot one column per table
			label: {
				type: Boolean,
				required: true,
			},
			// whether the column is a reference to another data source
			reference: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'DataSource',
			},
			// type of values in the row: boolean number text url
			type: {
				type: String,
				required: true,
			},
        }
    ]
});

const DataSource = mongoose.model("DataSource", dataSourceSchema);
module.exports = DataSource;