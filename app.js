require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const findOrCreate = require('mongoose-findorcreate');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(session({
  secret: "thisisuntold",
  saveUninitialized: false,
  resave: false,
  cookie:{maxAge: 2 * 24 * 60 * 60 * 1000}
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/untoldDB", {
  useNewUrlParser: true, useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  googleId: String,
  githubId: String,
  username:String,
  email:String,
  password: String,
  secrets: [String]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID:"126955715599-v1m0otm3e2870vr8p7evrq35bsmkhhgr.apps.googleusercontent.com",
  clientSecret:"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",
  callbackURL:"http://localhost:3000/auth/google/start"
},
function(refreshToken, accessToken, profile, done){
  User.findOrCreate({googleId:profile.id}, {username:profile.name.givenName, email:profile.email}, function(err, user){
    done(err ,user);
  });
}
))

passport.use(new GitHubStrategy({
    clientID: '9692ddee6c7433875682',
    clientSecret: 'de7a52a48ec6c61d8a84d8919f80cc6b7963f121',
    callbackURL: "http://localhost:3000/auth/github/start"
  },
  function(accessToken, refreshToken, profile, cb){
    User.findOrCreate({ githubId: profile.id }, {username:profile.displayName}, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup", {message:null});
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/start", (req, res)=>{
  if(req.isAuthenticated()){
    User.find({$expr:{$gt:[{$size:"$secrets"}, 0]}}, (err, foundLists)=>{
      if(err){
        console.log(err);
      }else{
        if(foundLists.length > 0){
          console.log("FoundLists", foundLists);
          res.render('start', {usersLists:foundLists, status:null});
        }else{
          res.render('start', {usersLists:[], status:"*cricket chirp...*"})
        }
      }
    })
  }else{
    res.redirect("/signin");
  }
});

app.get('/auth/google', passport.authenticate('google', {scope:['profile', 'email']}));

app.get('/auth/google/start', passport.authenticate('google', {failureRedirect:'/'}),
function(req, res){
  res.redirect('/start');
});

app.get('/auth/github',
  passport.authenticate('github', {scope:['profile', 'email']}));

  app.get('/auth/github/start', passport.authenticate('github', {failureRedirect:'/'}),
  function(req, res){
    res.redirect('/start')
  })

app.get("/submit", (req, res)=>{
  res.render("submit");
});

app.get("/logout", (req, res)=>{
  req.logout((err)=>{
    if(!err){res.redirect("/")}else{console.log(err)}
  })
});

function isValid(password){
  if(password.length < 8){
    return false;
  }
  if(!numberExists(password)){
    return false
  }
  return true;
}

function isNumber(c) {
	let codeZero = "0".charCodeAt(0);
	let codeNine = "9".charCodeAt(0);
	if (c >= codeZero && c <= codeNine) {
		return true;
	}
}

function numberExists(str){
	for(let i=0;i<str.length;i++){
		if(!isNumber(str[i].charCodeAt(0))){
			continue;
		}else{
			return true;
		}
	}
	return false;
}

app.post("/signup", (req ,res)=>{
  //For this to work the input fields in our form must have names as "username" and "password" and our Schema must have the same too
  const enteredPassword = req.body.password;
  if(!isValid(enteredPassword)){
    res.render("signup", {message:" Your password must have at least 8 characters with a number."});
  }else{
    User.register({username:req.body.username}, req.body.password, (err, user)=>{
      if(err){
        console.log(err);
        res.redirect("/signup");
      }else{
        passport.authenticate("local")(req, res, function(){
          res.redirect("/start");
        })
      }
    })
  }
})

app.post('/signin', (req, res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user, (err)=>{
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/start");
      })
    }
  });
});

app.post('/submit', (req, res)=>{
  const secret = req.body.secret;
  const secretID = new Date().getTime().toString() + Math.round(Math.random()*1000000).toString().slice(0, 16);
  const secretItem = {
    secret:secret,
    secretID:secretID
  }
  const userSecret = JSON.stringify(secretItem);
  User.findOneAndUpdate({_id:req.user.id}, {$push:{secrets:userSecret}}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      res.redirect('/start');
    }
  });
});

app.listen(3000, () => {
  console.log("server running on port 3000");
})
