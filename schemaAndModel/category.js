var mongoose = require('mongoose');
var categorySchema = {
	_id: {
		type:String,
		required:true
	},
	parent:{
		type:String,
		ref:'Categoty'
	},
	ancestors:[{
		type:String,
		ref:'Categoty'
	}]
};
module.exports = new mongoose.Schema(categorySchema);
module.exports.categorySchema = categorySchema;
