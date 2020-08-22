const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const categories = mongoose.model('categories');

const authornews = mongoose.model('news');
var url=mongoose.connect('mongodb://localhost:27017/portalDB',{useNewUrlParser: true},(err) =>{
  if (!err){ console.log('mongodb connection succeeded')}
    else {console.log('error in DB connection:'+err)}
 });


router.get('/',(req,res) => {
  let categoriesList = []
  categories.find().exec((err,docs)=>{
    if(!err){
            for(let cat of docs) {
              console.log(cat)
                categoriesList.push(cat.category)
            }
            res.render("authornew/authoraddnew",{
              viewTitle : "ADD NEWS",
              categories:categoriesList
            });
    }
    else{
      console.log('Error in retrieving employee list :' + err);
    }
  });   

  
});

router.post('/',(req,res) => {
        insertRecord(req, res);
});
function insertRecord(req,res){
   var Authornews = new authornews();
   Authornews.NewsHeading=req.body.NewsHeading;
   Authornews.newscategory=req.body.newscategory;
   Authornews.BreifNews=req.body.BreifNews;
   Authornews.image=req.body.image;
   Authornews.save((err,doc) => {
    if(!err)
            res.redirect("authornew/authorlistnew");
    else{
      if(err.name =='ValidationError'){
        handleValidationError(err,req.body);
        res.render("authornew/authoraddnew",{
    viewTitle : "ADD NEWS",
    Authornews: req.body
  });}
      else
       console.log('error:'+err); } });}

router.get('/authorlistnew',(req,res) => {
  authornews.find((err,docs)=>{
    if(!err){
      let authornews = [];
            for(let ne of docs) {
                let authornew = {
                    NewsHeading:ne.NewsHeading,
                    newscategory:ne.newscategory,
                    BreifNews:ne.BreifNews,
                    image:ne.image,
                    date:ne.date,
                    id:ne._id
                }
                authornews.push(authornew)
            }
      res.render("authornew/authorlistnew",{
      list2 : authornews});
      
  }
  else{
    console.log('Error in retrieving news :' + err);
  }
});

});

function handleValidationError(err,body){
  for(field in err.errors){
    switch(err.errors[field].path){
      case 'NewsHeading':
      body['NewsHeadingError']= err.errors[field].message;
      break;
      case 'newscategory':
         body['newscategoryError']= err.errors[field].message;
        break;
        case 'BreifNews':
         body['BreifNewsError']= err.errors[field].message;
        break;
        case 'image':
         body['BreifNewsError']= err.errors[field].message;
        break;
      default:
          break;
    }
  }

}




//router.get('/update/', (req, res) => {

//  authornews.find((err,docs)=>{
//          for(let ne of docs) {
  //              let nee= ne._id
    //             authornews.updateOne({"_id":objectId(nee)},{$set: } (err, doc) => {
      //              if (!err) { res.render("authornew/addnew", {
        //            viewTitle: 'Update author',
          //          authornews: req.body });}});}});});

categories.find((err,docs)=>{
    if(!err){
      let categories = [];
            for(let cat of docs) {
                let category = {
                    category:cat.category,
                    categoryDescription:cat.categoryDescription,
                    id:cat._id
                }
                categories.push(category)
            }
      
      list : categories;
    }
  });
router.get("/delete/:newsID", (req, res) => {
  const newsID = req.params.newsID
  if(!req.session.loggedIn) {
    res.redirect("/authorlogin")
  } 
  else {
    adminnews.deleteOne({"_id":newsID},function(err,result){
      console.log('Item deleted');
      res.redirect("/authornew/authorlistnew")
    });
  }
});

module.exports = router;