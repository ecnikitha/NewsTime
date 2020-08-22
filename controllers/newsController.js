const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const categories = mongoose.model('categories');

const news = mongoose.model('news');
// var url=mongoose.connect('mongodb+srv://newssite:newssite1234@cluster0.jcxlb.mongodb.net/portalDB?retryWrites=true&w=majority',{useNewUrlParser: true},(err) =>{
//   if (!err){ console.log('mongodb connection succeeded')}
//     else {console.log('error in DB connection:'+err)}
//  });


router.get('/',(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/adminlogin")
  } 
  else {
    let categoriesList = []
    categories.find().exec((err,docs)=>{
      if(!err){
              for(let cat of docs) {
                console.log(cat)
                  categoriesList.push(cat.category)
              }
              res.render("adminnew/addnews",{
                viewTitle : "ADD NEWS",
                categories:categoriesList
              });
      }
      else{
        console.log('Error in retrieving employee list :' + err);
      }
    });   
  }
  

  
});

router.post('/',(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/managenews/listnews")
  } 
  else {
    insertRecord(req,res)
  }
       
});
function insertRecord(req, res) {
  console.log("The request body - ", req);
  var newNews = new news();
  newNews.newsHeading = req.body.NewsHeading;
  newNews.newsCategory = req.body.newscategory;
  newNews.briefNews = req.body.BreifNews;
  newNews.newsImageURL = req.body.imageURL;
  newNews.postedBy = req.session.loggedInUsername;
  newNews.save((err, doc) => {
    console.log("Error occured in saving news - ",err)
    if (!err) res.redirect("/managenews/listnews");
    else {
      if (err.name == "ValidationError") {
        handleValidationError(err, req.body);
        res.render("/managenews/listnews", {
          viewTitle: "ADD NEWS",
          news: req.body,
        });
      } else console.log("error:" + err);
    }
  });
}

router.get('/listnews',(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/login")
  } 
  else {
    news.find((err,docs)=>{
      if(!err){
        let news = [];
              for(let ne of docs) {
                  let adminnew = {
                      NewsHeading:ne.newsHeading,
                      newscategory:ne.newsCategory,
                      BreifNews:ne.briefNews,
                      date:ne.date,
                      postedBy:ne.postedBy,
                      id:ne._id
                  }
                  news.push(adminnew)
              }
        res.render("adminnew/listnews",{
        list2 : news});
        
    }
    else{
      console.log('Error in retrieving news :' + err);
    }
  });
  }


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
      default:
          break;
    }
  }

}

router.get("/update/:newsID",(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/login")
  }
  else {
    let categoriesList = []
    categories.find().exec((err,docs)=>{
      if(!err){
              for(let cat of docs) {
                console.log(cat)
                  categoriesList.push(cat.category)
              }
      }
      else{
        console.log('Error in retrieving employee list :' + err);
      }
    }); 


    news.findOne({_id:req.params.newsID},(err,news) => {
      console.log("Found news = ",news)
      if(!err) {
        res.render("adminnew/editnews",{news:news.toJSON(),categories:categoriesList})
      }
    })
  }
})

router.post("/update/:newsID",(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/login")
  }
  else {
    news.findOne({_id:req.params.newsID},async (err,news) => {
      news.newsHeading = req.body.newsHeading;
      news.newsCategory = req.body.newsCategory;
      news.briefNews = req.body.briefNews;
      news.newsImageURL = req.body.newsImageURL;
      await news.save();
      res.redirect("/managenews/listnews")
    })
  }
})



router.get("/delete/:newsID", (req, res) => {
  const newsID = req.params.newsID
  if(!req.session.loggedIn) {
    res.redirect("/login")
  } 
  else {
    news.deleteOne({"_id":newsID},function(err,result){
      console.log('Item deleted');
      res.redirect("/managenews/listnews")
    });
  }
});

module.exports = router;