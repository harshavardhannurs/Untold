require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');
const findOrCreate = require('mongoose-findorcreate');
const saltRounds = 10;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(session({
  secret: "thisisuntold",
  saveUninitialized: false,
  resave: false,
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/untoldDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  googleId: String,
  githubId: String,
  email: String,
  password: String,
  secret: String,
  username:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(null, user);
  });
});

// passport.createStrategy(new GoogleStrategy({
//   clientID:,
//   clientSecret:,
//   callbackURL:
// },
// function(refreshToken, accessToken, profile, done){
//   User.findOrCreate({googleId:profile.id}, {name:profile.name.givenName}, function(err, user){
//     done(err ,user);
//   });
// }
// ))

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/start", (req, res)=>{
  res.render('start');
});

app.post("/signup", (req ,res)=>{
  const email = req.body.registerEmail;
  const password = req.body.registerPassword;
  bcrypt.hash(password, saltRounds, (err, hash)=>{
    if(!err){
      const newUser = new User({
        email:email,
        password:hash
      })
      newUser.save((err)=>{
        if(err){
          console.log(err);
        }else{
          res.redirect('/start');
        }
      });
    }else{
      console.log(error);
    }
  })
})

app.post('/signin', (req, res)=>{
  const email = req.body.loginEmail;
  const password = req.body.loginPassword;
  User.findOne({email:email}, (err, result)=>{
    if(err){
      console.log(err);
    }else{
      if(result){
        bcrypt.compare(password, result.password, (err, outcome)=>{
          if(outcome==true){
            console.log(true);
            res.redirect("/start")
          }else{
            res.redirect("/login")
          }
        })
      }
    }
  })
});

app.listen(3000, () => {
  console.log("server running on port 3000");
})
