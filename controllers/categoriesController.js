const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var objectId =require('mongoose').ObjectID;
const categories = mongoose.model('categories');
// var url=mongoose.connect('mongodb://localhost:27017/portalDB',{useNewUrlParser: true},(err) =>{
//   if (!err){ console.log('mongodb connection succeeded')}
//     else {console.log('error in DB connection:'+err)}
//  });


router.get('/',(req,res) => {

  if(req.session.loggedIn && req.session.loggedInUserType === 'admin') {
    res.render("category/addcat",{
      viewTitle : "INSERT CATEGORY"
    });
  }
  else {
    res.redirect("/")
  }
});

router.post('/',(req,res) => {
        insertRecord(req, res);
});
function insertRecord(req,res){
   var categries = new categories();
   categries.category=req.body.category;
   categries.categoryDescription=req.body.categoryDescription;
   categries.save((err,doc) => {
    if(!err)
            res.redirect("category/list");
    else{
      if(err.name =='ValidationError'){
        handleValidationError(err,req.body);
        res.render("category/addcat",{
    viewTitle : "INSERT CATEGORY",
    categries: req.body
  });}
      else
       console.log('error:'+err); } });}


router.get("/list", (req, res) => {
  if (req.session.loggedIn && req.session.loggedInUserType === "admin") {
    categories.find((err, docs) => {
      if (!err) {
        let categories = [];
        for (let cat of docs) {
          let category = {
            category: cat.category,
            categoryDescription: cat.categoryDescription,
            id: cat._id,
          };
          categories.push(category);
        }
        res.render("category/list", {
          list: categories,
        });
      } else {
        console.log("Error in retrieving employee list :" + err);
      }
    });
  } else {
    res.redirect("/");
  }
});

function handleValidationError(err,body){
  for(field in err.errors){
    switch(err.errors[field].path){
      case 'category':
      body['categoryError']= err.errors[field].message;
      break;
      case 'categoryDescription':
         body['categoryDescriptionError']= err.errors[field].message;
        break;
      default:
          break;
    }
  }

}


router.get("/update/:catID",(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/login")
  }
  else {
    categories.findOne({_id:req.params.catID},(err,category) => {
      if(!err) {
        res.render("category/editcat",{category:category.toJSON()})
      }
    })
  }
})

router.post("/update/:catID",(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/login")
  }
  else {
    categories.findOne({_id:req.params.catID},async (err,category) => {
      category.category = req.body.category;
      category.categoryDescription = req.body.categoryDescription;
      await category.save();
      res.redirect("/category/list")
    })
  }
})


router.get("/delete/:categoryID", (req, res) => {
  categories.deleteOne({ _id: req.params.categoryID }, function (err, result) {
    console.log("Item deleted");
    res.redirect("/category/list");
  });
});

module.exports = router;