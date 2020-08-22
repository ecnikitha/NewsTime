require("./models/db");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
var app = express();
var _ = require("lodash");
const fetch = require("node-fetch");
const path = require("path");
const exphbs = require("express-handlebars");
const categories = mongoose.model("categories");

const news = mongoose.model("news");
const users = mongoose.model("users");


var fs = require("fs");
require("dotenv/config");
var multer = require("multer");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/static/"));
app.use(session({secret:'ThisIsASecret',cookie:{maxAge:3600*1000}}))
app.use(bodyParser.json());
app.set("views", path.join(__dirname, "views/"));
app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
    defaultLayout: "mainLayouts",
    layoutsDir: __dirname + "/views/layouts/",
  })
);
app.set("view engine", "ejs");
app.set("view engine", "hbs");

//Controllers

const categoriesController = require("./controllers/categoriesController");
const authorsController = require("./controllers/authorsController");
const newsController = require("./controllers/newsController");
const authornewsController = require("./controllers/authornewsController");

//End of Controllers

let authors = ["Karthik", "Nikitha", "Padma", "Chinnabba"];
app.get("/news/:category", async function (req, res) {
  let category = req.params.category;
  console.log("Category = ", category);
  //  await fetch("http://newsapi.org/v2/everything?q="+category+"&sortBy=publishedAt&language=en&apiKey=0d957aab531a4aa8bfcb72cc22923058")
  //     .then(response => response.json())
  //     .then(response => {
  //         news_articles = response.articles
  //     })
  //     .catch(error => {
  //         console.log(error)
  //     })
  let news_articles = [];

  await news.find({ newsCategory: category }).exec((err, docs) => {
    if (!err) {
      for (let news of docs) {
        news_articles.push(news);
      }
    } else {
      console.log("Error in retrieving employee list :" + err);
    }
  });

  let categoriesList = [];
  await categories.find((err, docs) => {
    if (!err) {
      let categories = [];
      for (let cat of docs) {
        categoriesList.push(cat.category);
      }
    } else {
      console.log("Error in retrieving employee list :" + err);
    }
  });
  console.log("The session in category news = ",req.session)
  res.render("indexpage/news.ejs", {
    articles: news_articles,
    authors: authors,
    categories: categoriesList,
    isLoggedIn:req.session.loggedIn,
    loggedInUserName:req.session.loggedInUserName
  });
});

app.get("/", async function (req, res) {
  let news_articles = []; //default news
  // await fetch(
  //   "http://newsapi.org/v2/everything?q=india&sortBy=publishedAt&language=en&apiKey=0d957aab531a4aa8bfcb72cc22923058"
  // )
  //   .then((response) => response.json())
  //   .then((response) => {
  //     news_articles = response.articles;
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
  news.find((err,docs) => {
    for(let news of docs) {
      news_articles.push(news)
    }
  })

  let categoriesList = [];
  await categories.find((err, docs) => {
    if (!err) {
      let categories = [];
      for (let cat of docs) {
        categoriesList.push(cat.category);
      }
    } else {
      console.log("Error in retrieving employee list :" + err);
    }
  });

  let authorsList = [];

  await users.find((err, docs) => {
    if (!err) {
      for (let cat of docs) {
        authorsList.push({name:cat.name,username:cat.username});
      }
    } else {
      console.log("Error in retrieving employee list :" + err);
    }
  });

  console.log("The Session = ",req.session)
  res.render("indexpage/index.ejs", {
    articles: news_articles,
    authors: authorsList,
    categories: categoriesList,
    isLoggedIn:req.session.loggedIn,
    loggedInUserName:req.session.loggedInUserName
  });
});


app.get("/main", function (req, res) {
  res.render("main.ejs");
});

app.get("/login", function (req, res) {
  res.render("adminlogin.ejs");
});

app.post("/login", function (req, res) {
  if (req.body.email.length == 0) {
    res.send("incorrect username or password!dd");
  } else {
    users.find({email:req.body.email,password:req.body.password},(err,docs) => {

      if(!err && docs.length!==0){
        req.session.loggedIn = true
        req.session.loggedInUsername = docs.username
        req.session.loggedInUserName = docs.name
        req.session.loggedInUserID = docs._id
        req.session.loggedInUserType = docs.userType
        res.redirect("/");
        console.log("Session = ",req.session)
      } else {
        res.send("incorrect username or password!d");
      }
    });
    
  }
});

app.get("/controlpanel",function(req,res) {
  if(!req.session.loggedIn) {
    res.redirect("/login")
  } 
  else {
    users.findOne({_id:req.session.loggedInUserID},(err,docs) => {
      console.log("Logged In UserType = ",docs.userType)
      res.render("main.ejs",{userType:docs.userType})
    })
    
  }
})

app.get("/logout", (req,res) => {
  req.session.loggedIn = false;
  res.redirect("/")
})

app.get("/fullnews/:newsID", async (req,res) => {



  let categoriesList = [];
  await categories.find((err, docs) => {
    if (!err) {
      let categories = [];
      for (let cat of docs) {
        categoriesList.push(cat.category);
      }
    } else {
      console.log("Error in retrieving employee list :" + err);
    }
  });

  let authorsList = [];

  await users.find((err, docs) => {
    if (!err) {
      for (let cat of docs) {
        authorsList.push({name:cat.name,username:cat.username});
      }
    } else {
      console.log("Error in retrieving employee list :" + err);
    }
  });

  news.findOne({_id:req.params.newsID},(error,news) => {
    res.render("indexpage/fullnews.ejs", {
      authors: authorsList,
      categories: categoriesList,
      news:news.toJSON(),
      isLoggedIn:req.session.loggedIn,
      loggedInUserName:req.session.loggedInUserName
    });
  });
})

app.get("/adminregister",(req,res) => {
  //Render the form
  res.render("adminregister.ejs",{anyMessage:false})
})

app.post("/adminregister",(req,res) => {
  //Render the form
  users.find({userType:"admin"},(error,docs) => {
    if(docs.length>=1) {
      res.render("adminregister.ejs",{anyMessage:true,messageType:"error",message:"An Administrator is already present"});
    }
    else {
      let user = new users();
      user.name = "Administrator";
      user.email = req.body.email;
      user.password = req.body.password;
      user.username = "admin";
      user.userType = "admin";
      user.save();
      res.render("adminregister.ejs",{anyMessage:true,messageType:"success",message:"You are registered. Please go to home page and login"});
    }
  })
})

app.use("/category", categoriesController);
app.use("/managenews", newsController);
app.use("/authors",authorsController)

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on the port 3000");
});
