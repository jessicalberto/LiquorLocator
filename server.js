//This is the list of all the packages/plugins we've installed thus far.
const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const yelp = require('yelp-fusion');
const passport = require('passport');
const mongoose = require('mongoose');


//These are global variables that we initialize here,to later pass to each of the profiles to maintain session information as user acccesses different functions of the website.
var useridpass = "";
var mainusername = "";
var mainuserphoto = "";
var mainusergender = "";
var mainuseremail = "";

//This is init for Facebook Passport package to enable Facebook oauth.
var FacebookStrategy = require('passport-facebook').Strategy;
app.use(require('express-session')({secret: 'verysecret', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

// Access MongodB Link with Password
var config = require('./config');
var mongoDBkey = config.mongoLink;

//This is init for Mongoose DB, connecting with Mlabs via URL.
mongoose.connect(mongoDBkey)
var db = mongoose.connection;

//Linking a core schema with our mongoose db.
var Schema = mongoose.Schema;

//The schema for Yelp API results, storing the query and all results (restaurants, photos, ratings, address).
var resultSchema = new Schema({
  queryterm: String,
  querylocation: String,
  //Restaurant/Bar 1
  restaurant1: String,
  rating1: String,
  address1: String,
  photo1: String,
  price1: String,
  //Restaurant/Bar 2
  restaurant2: String,
  rating2: String,
  address2: String,
  photo2: String,
  price2: String,
  //Restaurant/Bar 3
  restaurant3: String,
  rating3: String,
  address3: String,
  photo3: String,
  price3: String
});

//Schema for storing our user information, coming from FB Passport oauth
var userSchema = new Schema({
  id: String,
  fbtoken: String,
  fbemail: String,
  name: String,
  photo: String
});

//Storing each of the models into an accessible, easy to write var
var result = mongoose.model('result', resultSchema);
var User = mongoose.model('user', userSchema);

//Accessing our config keys
var keys = require('./config');
var myKey = keys.mykey;
var secretKey= keys.secretkey;
var myconsumerKey = keys.consumerKey;
var myconsumerSecret = keys.consumerSecret;
var mygoogleKey = keys.googleKey;

//Base syntax for FB Strategy/Passport oauth
passport.use(new FacebookStrategy({
  clientID: keys.fbAppId,
  clientSecret: keys.fbAppSecret,
  callbackURL: 'http://localhost:8000/login/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'photos', 'gender', 'about'], //parameters we're accessing for each FB login
},
function(token, refreshToken, profile, done) {
  process.nextTick(function() {

//Initializing the global variables of username/userphoto/gender/email as persistent data across all functions in a session
    mainusername = profile.name.givenName + " " + profile.name.familyName;
    mainuserphoto = profile.photos[0].value;
    mainusergender = profile.gender;
    mainuseremail = profile.emails[0].value;
    useridpass = profile.id;

//This is debugging/ABP purposes, to ensure we're recieving everything correctly
    console.log("PROFILE ID: " + profile.id);
    console.log("PROFILE TOKEN: " + token);
    console.log("PROFILE NAME: " + profile.name.givenName + " " + profile.name.familyName);
    console.log("PROFILE EMAILS: " + profile.emails[0].value);
    console.log("PROFILE PHOTO: " + profile.photos[0].value);
    console.log("GENDER: " + profile.gender);
    console.log("AGE: " + profile.age);

//In our database of users, look for someone with the profile.id, if exists, that means user already exists in db
    db.collection("users").findOne({ 'id': profile.id}, function(err, user) {
      if (err)
        return done(err);
     if (user) {
       console.log("User already exists in database!");
       return done(null, user);
     }
     else {

//Otherwise, if there's no entry found in the user DB with the equivalent profile.id, that means it's a new user + time to store them in db
       console.log("***User does not currently exist in database***");

//Once confirmed not in database, then insert all parameters into database based on earlier userSchema
       db.collection("users").insert({
         id: profile.id,
         fbtoken: token,
         name: profile.name.givenName + " " + profile.name.familyName,
         gender: profile.gender,
         email: profile.emails[0].value,
         photo: profile.photos[0].value
       })
          return done(null, user);
     }
   });
 });
}));

//Base syntax for serializing sessions upon login/logoff
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

/*Authenticating our Yelp search, first using our stored Yelp keys + secret to retrieve our
token, THEN after successfully obtaining our token, initialize ourselves as a "client" so we
may use the Yelp API.*/
const yelptoken = yelp.accessToken(myKey, secretKey).then(response => {
  const client = yelp.client(response.jsonBody.access_token);

  console.log("App is up and running!");
  //Listens on port 8000 for a request

  app.listen(8000, function() {
    console.log("Running and listening on PORT 8000");
  })

  //Sets the route for the home page, logs once in terminal msg, sendFiles of our home.html
  //Simply renders the home page which forces user login before access to other functions
  app.get("/", function(req, res) {
    console.log("User requesting/landing on homepage.");
    res.sendFile(__dirname + "/views/home.html");
  });

  //Initializes a session needed for our FB oauth
  app.use(passport.initialize());
  app.use(passport.session());

    app.get("/login/facebook/callback", passport.authenticate('facebook',
    {session: false,
      failureRedirect: '/',
      successRedirect: '/successful_login'
    }));

  //Sets the page that links to the loginto twitter authentication page
  app.get("/login/facebook", passport.authenticate('facebook', {scope: 'email'}));
 //Sets the redirect, // Pass in Facebook information to redirect page

 var userfullname;
 var usergender;
 var useremail;
 var userphoto;

  //Routing to the home page upon successfully logging into the website, lets user access rest of functionality
  app.get("/successful_login", function(req, res) {

    //ABP + logging to notify of successful log in
    console.log("Successful user log in");
    console.log("user id = " + useridpass);

    //Find the user in the database and then return/init the earlier global variables in order to populate user info box/maintain
    //those details as persistent data in profile info box across all pages in a session
    db.collection("users").find( {id: useridpass}).toArray(function(err, result) {

      //logs just to ensure correct matching of outputs
      console.log("result after searching for " + useridpass + ": " + JSON.stringify(result));
      console.log("NAME: " + JSON.stringify(result[0].name));
      console.log("GENDER: "+ JSON.stringify(result[0].gender));
      console.log("EMAIL: " + JSON.stringify(result[0].email));
      console.log("PHOTO: " + JSON.stringify(result[0].photo));

      //init variables with corresponding results
      userfullname = result[0].name;
      usergender = result[0].gender;
      useremail = result[0].email;
      userphoto = result[0].photo;
    });

    //based on one's gender, return them the stage of drunkness view that corresponds to their gender
    //i.e, if male, return /buzzedmale for the buttons they click on, female returns /buzzedfemale for the buttons they click on
    var buzzedurl = "/buzzed" + usergender;
    console.log("buzzed URL = " + buzzedurl);

    var tipsyurl = "/tipsy" + usergender;
    console.log("tispy URL = " + tipsyurl);

    var drunkurl = "/drunk" + usergender;
    console.log("drunk URL = " + drunkurl);

    var hammeredurl = "/hammered" + usergender;
    console.log("hammered URL = " + hammeredurl);

    //pass on all persistent data to the main homepage ejs in order to populate user info box + map correct gender-based URLs to the buttons
    res.render(__dirname + "/views/homeUser.ejs", {userfullname, usergender, useremail, userphoto, buzzedurl, tipsyurl, drunkurl, hammeredurl});

  });

  //routing for when user uses the Yelp API search functionality upon click "Search" and entering in parameters
  app.get("/yelpresult", function(req, res) {

    //logging user queries to ensure correct read-in via back-end
    console.log("SEARCH = " + req.query.search);
    console.log("LOCATION = " + req.query.location);

    //Scan through our results collections db, if the query term && querylocation match the user's inputs, then we know an entry already exists
    db.collection("results").find( {queryterm: req.query.search, querylocation: req.query.location}).toArray(function(err, result) {
      if (result != "") {
        console.log("Found!  An entry already exists in database.");
        res.render(__dirname + "/views/cachedResult.ejs", {result});
        console.log(result);
      }

      else {

        /*Otherwise, if scan-through doesn't show any matching queryterms && querylocation
        (i.e a search of "bourbon" in "new york" != "bourbon" in "boston"), then call the Yelp
        API, search it, return results, and store those results in db
        */
        console.log("Doesn't exist!  Call the Yelp API + storing in db!");

        client.search({
          term: req.query.search,
          location: req.query.location
        }).then (response => {
          console.log(response.jsonBody.businesses[0].name);
          var tophit = response.jsonBody.businesses[0].name;
          var biz_id = response.jsonBody.businesses[0].id;

          console.log("***FIRST THREE RESULTS***");

          //This variable is just to consolidate/simplify response.jsonBody every time
          var setresp = response.jsonBody;

          console.log("**Query search = " + req.query.search);
          console.log("**Query location = " + req.query.location);

          console.log("Name 1: " + setresp.businesses[0].name);
          console.log("Rating: " + setresp.businesses[0].rating);
          console.log("Location: " + setresp.businesses[0].location);
          console.log("Price Level: " + setresp.businesses[0].price);

          // Storing the data/results from the first result (RESTAURANT/BAR 1)
          var result1 = setresp.businesses[0].name;
          var rate1 = " Rating: " + setresp.businesses[0].rating;
          var location1 = setresp.businesses[0].location.display_address;
          var priceRange1 = "Price Level: " + setresp.businesses[0].price;
          var image1 = setresp.businesses[0].image_url;

          // Storing the data/results from the first result (RESTAURANT/BAR 2)
          var result2 = setresp.businesses[1].name;
          var rate2 = " Rating: " + setresp.businesses[1].rating;
          var location2 = setresp.businesses[1].location.display_address;
          var priceRange2 = "Price Level: " + setresp.businesses[1].price;
          var image2 = setresp.businesses[1].image_url;

          // Storing the data/results from the first result (RESTAURANT/BAR 3)
          var result3 = setresp.businesses[2].name;
          var rate3 = " Rating: " + setresp.businesses[2].rating;
          var location3 = setresp.businesses[2].location.display_address;
          var priceRange3 = "Price Level: " + setresp.businesses[2].price;
          var image3 = setresp.businesses[2].image_url;

          /*This is the built-in method for inserting things into our database.  So since we
          have already parsed our results from the API result into its own variable, we can just
          push these/store these in the database based on our resultSchema from earlier.
          MongoDB itself has collections and each collection is its own "database". */

          db.collection("results").insert({
            // Restaurant 1
            queryterm: req.query.search,
            querylocation: req.query.location,
            restaurant1: result1,
            rating1: rate1,
            address1: location1,
            photo1: image1,
            price1: priceRange1,

            //Restaurant 2
            restaurant2: result2,
            rating2: rate2,
            address2: location2,
            photo2: image2,
            price2: priceRange2,

            //Restaurant 3
            restaurant3: result3,
            rating3: rate3,
            address3: location3,
            photo3: image3,
            price3: priceRange3
          });

          //Logging to confirm that the insertion in db is successful.
          console.log("Successfully stored new results into database!");

          //Thus, render this new page, searchResult.ejs, and pass in all these data vars so that we may display these vars on the front end
          res.render(__dirname + "/views/searchResult.ejs", { result1,rate1,location1, image1,priceRange1,result2,rate2,location2,image2,priceRange2,result3,rate3,location3, image3,priceRange3});

        })

      }

    })

  });

});

// Render button ridirect pages for buzzed, tipsy, drunk, hammered based on user's genders.
app.get("/buzzedmale", function(req, res) {
  res.render(__dirname + "/views/drunk_level/buzzedmale.ejs", {mainusername, mainuserphoto, mainusergender, mainuseremail});
 });
 app.get("/buzzedfemale", function(req, res) {
   res.render(__dirname + "/views/drunk_level/buzzedFemale.ejs", {mainusername, mainuserphoto, mainusergender, mainuseremail});
 })

app.get("/tipsymale", function(req, res) {
  res.render(__dirname + "/views/drunk_level/tipsyMale.ejs", {mainusername, mainuserphoto, mainusergender, mainuseremail});
 });
 app.get("/tipsyfemale", function(req, res) {
   res.render(__dirname + "/views/drunk_level/tipsyFemale.ejs", {mainusername, mainuserphoto, mainusergender, mainuseremail});
  });

app.get("/drunkmale", function(req, res) {
  res.render(__dirname + "/views/drunk_level/drunkMale.ejs", {mainusername, mainuserphoto, mainusergender, mainuseremail});
 });
 app.get("/drunkfemale", function(req, res) {
   res.render(__dirname + "/views/drunk_level/drunkFemale.ejs", {mainusername, mainuserphoto, mainusergender, mainuseremail});
});

app.get("/hammeredmale", function(req, res) {
  res.render(__dirname + "/views/drunk_level/hammeredMale.ejs", {mainusername, mainuserphoto, mainusergender, mainuseremail});
 });
 app.get("/hammeredfemale", function(req, res) {
   res.render(__dirname + "/views/drunk_level/hammeredFemale.ejs", {mainusername, mainuserphoto, mainusergender, mainuseremail});
});
