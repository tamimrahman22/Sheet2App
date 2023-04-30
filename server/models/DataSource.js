const mongoose = require('mongoose');
const dataSourceSchema = new mongoose.Schema({
	// name of Sheet
    sheetName: {
		type: String,
		required: true,
	},
	// name of the spreadsheet
	spreadSheetName: {
		type: String,
		required: true 	
	},
	// name of the DataSouce
	dataSourceName: {
		type: String, 
		required: true 
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
	// name of the unique key column of the data source!
	keys: {
		type: String,
		required: false,
		default: ''
	}, 
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
				default: null
			},
			// indicates whether column is used as the link text for references to record, set to true for at msot one column per table
			label: {
				type: Boolean,
				required: true,
			},
			// if we are referencing another data source, which data source? 
			dataSourceReference: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'DataSource',
				default: null,
			},
			// what column of the data source are we referencing? 
			columnReference:{
				type: mongoose.Schema.Types.ObjectId, 
				default: null 
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