const mongoose = require('mongoose');
const dataSourceSchema = new mongoose.Schema({
    name: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	sheetIndex: {
		type: Number,
		required: true,
	},
	keys: {
		type: Number,
		required: true,
	},
    columns: [
        {
            name: {
				type: String,
				required: true,
			},
			initialValue: {
				type: String,
			},
			label: {
				type: Boolean,
				required: true,
			},
			reference: {
				type: mongoose.Schema.Types.Mixed,
				ref: 'Table',
			},
			type: {
				type: String,
				required: true,
			},
        }
    ]
});

const DataSource = mongoose.model("DataSource", dataSourceSchema);
module.exports = DataSource;