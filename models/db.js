 const mongoose = require('mongoose');



 mongoose.connect('mongodb+srv://newssite:newssite1234@cluster0.jcxlb.mongodb.net/portalDB?retryWrites=true&w=majority',{useNewUrlParser: true},(err) =>{
 	if (!err){ console.log('mongodb connection succeeded')}
 		else {console.log('error in DB connection:'+err)}
 });

require('./category.model')
require('./users.model')
require('./news.model')




