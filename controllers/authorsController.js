const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const authors = mongoose.model('users');
const news = mongoose.model('news');
const categories = mongoose.model('categories');
// var url=mongoose.connect('mongodb://localhost:27017/portalDB',{useNewUrlParser: true},(err) =>{
//   if (!err){ console.log('mongodb connection succeeded')}
//     else {console.log('error in DB connection:'+err)}
//  });

router.get("/", (req,res) => {
  res.redirect("/authors/listauth")
});

router.get('/add',(req,res) => {
  if(req.session.loggedIn && req.session.loggedInUserType === 'admin') {
    res.render("authors/addauth",{
      viewTitle : "ADD AUTHOR"
    });
  }
  else {
    res.redirect("/")
  }
  
});

router.post('/add',(req,res) => {
        insertRecord(req, res);
});
function insertRecord(req, res) {
  authors.find({email:req.body.authorEmail},(error,docs) => {
    if(docs.length>=1) {
      res.render("authors/addauth",{error:true,errorMessage:"Author already exists with the given email ID"})
    }
    else {
      console.log("req body - ",req.body)
      var Authors = new authors();
      Authors.name = req.body.name;
      Authors.email = req.body.authorEmail;
      Authors.password = req.body.password;
      Authors.username = req.body.username;
      Authors.userType = "author";
      Authors.save((err, doc) => {
        console.log("Error -> ",err)
        if (!err) res.redirect("/authors/listauth");
        else {
          if (err.name == "ValidationError") {
            handleValidationError(err, req.body);
            res.render("authors/addauth", {
              viewTitle: "ADD AUTHOR",
              Authors: req.body,
            });
          } else console.log("error:" + err);
        }
      });
    }
  })

}

router.get("/listauth", (req, res) => {
  if (req.session.loggedIn && req.session.loggedInUserType === "admin") {
    authors.find({ userType: "author" }, (err, docs) => {
      if (!err) {
        let authors = [];
        for (let auth of docs) {
          let author = {
            name: auth.name,
            email: auth.email,
            password: auth.password,
            id: auth._id,
          };
          authors.push(author);
        }
        res.render("authors/listauth", {
          list1: authors,
        });
      } else {
        console.log("Error in retrieving author list :" + err);
      }
    });
  } else {
    res.redirect("/");
  }
});

function handleValidationError(err,body){
  for(field in err.errors){
    switch(err.errors[field].path){
      case 'author':
      body['authorError']= err.errors[field].message;
      break;
      case 'authorEmail':
         body['authorEmailError']= err.errors[field].message;
        break;
        case 'password':
         body['passwordError']= err.errors[field].message;
        break;
      default:
          break;
    }
  }

}




router.get("/update/:authID",(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/login")
  }
  else {
    authors.findOne({_id:req.params.authID},(err,author) => {
      if(!err) {
        console.log("Update author = ",author)
        res.render("authors/editauth",{author:author.toJSON()})
      }
    })
  }
})

router.post("/update/:authID",(req,res) => {
  if(!req.session.loggedIn) {
    res.redirect("/login")
  }
  else {
    authors.findOne({_id:req.params.authID},async (err,user) => {
      user.name = req.body.name;
      user.email = req.body.authorEmail;
      user.password = req.body.password;
      await user.save();
      res.redirect("/authors/listauth")
    })
  }
})



router.get("/delete/:authID", (req, res) => {
  const authID = req.params.authID
  if(!req.session.loggedIn) {
    res.redirect("/login")
  } 
  else {
    authors.deleteOne({"_id":authID},function(err,result){
      console.log('Item deleted');
      res.redirect("/authors/listauth")
    });
  }
});


router.get("/:authorUsername",async (req,res) => {

  let categoriesList = [];
  await categories.find((err, docs) => {
    if (!err) {
      for (let cat of docs) {
        categoriesList.push(cat.category);
      }
    } else {
      console.log("Error in retrieving employee list :" + err);
    }
  });

  let authorsList = [];

  await authors.find((err, docs) => {
    if (!err) {
      for (let cat of docs) {
        authorsList.push({name:cat.name,username:cat.username});
      }
    } else {
      console.log("Error in retrieving employee list :" + err);
    }
  });

  //Show only news of particular author
  news.find({postedBy:req.params.authorUsername},(err,newsArticles) => {
    res.render("indexpage/news.ejs",{articles:newsArticles,categories:categoriesList,authors:authorsList,isLoggedIn:req.session.loggedIn,loggedInUserName:req.session.loggedInUserName})
    console.log(newsArticles)
  })
})




module.exports = router;