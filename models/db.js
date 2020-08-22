 const mongoose = require('mongoose');



 mongoose.connect('mongodb://localhost:27017/portalDB',{useNewUrlParser: true},(err) =>{
 	if (!err){ console.log('mongodb connection succeeded')}
 		else {console.log('error in DB connection:'+err)}
 });

require('./category.model')
require('./users.model')
require('./news.model')




