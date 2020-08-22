const mongoose = require('mongoose');
var validator = require("email-validator");
 var authorSchema=new mongoose.Schema({
 	email:{
 		type: String,
 		required: 'This is required field'
	 },
	 username: {
		type:String,
		required:"This is required"
	 },
 	password:
 	{
 		type: String,
 		required: 'This is required field'
 	},
 	userType:
 	{
 		type: String,
 		required: 'This is required field'
	 },
	 name:{
		 type:String,
		 required:'This field is required'
	 }
 });
 mongoose.model('users',authorSchema);

 authorSchema.path('email').validate((val) => {
    return validator.validate(val);
},'Invalid Email');