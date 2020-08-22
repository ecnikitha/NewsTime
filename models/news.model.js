const mongoose = require('mongoose');
 var adminnewSchema=new mongoose.Schema({
 	newsHeading:{
 		type: String,
 		required: 'This is required field'
	 },
	 postedBy:{
		 type:String,
		 required:'This is required field'
	 },
 	newsCategory:
 	{
 		type: String,
 		required: 'This is required field'
 	},
 	briefNews:
 	{
 		type: String,
 		required: 'This is required field'
	 },
	 newsImageURL:
 	{
 		type: String,
 		required: 'This is required field'
 	},
 	date:
 	{
 	   type: Date, default: Date.now 
 	}
 });
 mongoose.model('news',adminnewSchema); 

