const mongoose = require('mongoose');
 var categorySchema=new mongoose.Schema({
 	category:{
 		type: String,
 		required: 'This is required field'
 	},
 	categoryDescription:
 	{
 		type: String,
 		required: 'This is required field'
 	}
 });
 mongoose.model('categories',categorySchema); 