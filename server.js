//This is the list of all the packages/plugins we've installed thus far.
const express = require("express");
const app = express();
const bodyParser=require('body-parser');
const yelp = require('yelp-fusion');
const passport = require('passport');
const mongoose = require('mongoose');

var useridpass = "";
var FacebookStrategy = require('passport-facebook').Strategy;
app.use(require('express-session')({secret: 'verysecret', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

//This is the block of code that enables us to connect mongoose to our database
//We're using the built-in .connect method and the URL given from MLAB (which is a free mongoDB database)
//URL was provided by Mlab, but in short, just username + password + everything else
mongoose.connect('mongodb://yishan:dosequis@ds161029.mlab.com:61029/usersweightdrink')
var db = mongoose.connection;

//This sets our "schema", which is how we're setting up the table
//We will likely need multiple schemas (one for users, one for something else)
var Schema = mongoose.Schema;

/*JWe parsed the API result to display the top 3 restaurants/bars that return what
you're looking for, along with its average star rating and its address.
*/

var resultSchema = new Schema({
  queryterm: String,
  querylocation: String,
  //Restaurant 1
  restaurant1: String,
  rating1: String,
  address1: String,
  photo1: String,
  price1: String,
  //Restaurant 2
  restaurant2: String,
  rating2: String,
  address2: String,
  photo2: String,
  price2: String,
  //Restaurant 3
  restaurant3: String,
  rating3: String,
  address3: String,
  photo3: String,
  price3: String
});

var userSchema = new Schema({
  id: String,
  fbtoken: String,
  fbemail: String,
  name: String,
  photo: String
});

var result = mongoose.model('result', resultSchema);
var User = mongoose.model('user', userSchema);
/*Schemas can take a variety of data types, like Integers, String, Objects
but we are held kind of contingent to the data types that Yelp API returns
(i.e, Yelp returns the rating of each restaurant as a String, not an int)+
Strings seem to be the easiest as of now.
*/

/*LOGIN FOR TWITTER OAUTH PASSPORT */

var keys = require('./config');
var myKey = keys.mykey;
var secretKey= keys.secretkey;
var myconsumerKey = keys.consumerKey;
var myconsumerSecret = keys.consumerSecret;
var mygoogleKey = keys.googleKey;

//Using the npm package of passport/twitter strategy to setup our Twitter oauth, base syntax (lifted & shifted)

passport.use(new FacebookStrategy({
  clientID: keys.fbAppId,
  clientSecret: keys.fbAppSecret,
  callbackURL: 'http://localhost:8000/login/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'photos', 'gender', 'about'],
},
function(token, refreshToken, profile, done) {
  process.nextTick(function() {

    console.log("PROFILE ID: " + profile.id);
    console.log("PROFILE TOKEN: " + token);
    console.log("PROFILE GIVEN NAME: " + profile.name.givenName + " " + profile.name.familyName);
    console.log("PROFILE EMAILS: " + profile.emails[0].value);
    console.log("PROFILE PHOTO: " + profile.photos[0].value);
    console.log("GENDER: " + profile.gender);
    console.log("AGE: " + profile.age);

    useridpass = profile.id;

    db.collection("users").findOne({ 'id': profile.id}, function(err, user) {
      if (err)
        return done(err);
     if (user) {
       console.log("!!!USER ALREADY EXISTS IN DB!!!");
       return done(null, user);
     }
     else {

       console.log("***USER DOES NOT CURRENTLY EXIST IN DB***");

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
may use the Yelp API.
*/
const yelptoken = yelp.accessToken(myKey, secretKey).then(response => {
  const client = yelp.client(response.jsonBody.access_token);

  console.log("App is up and running!");
  //Listens on port 8000 for a request

  app.listen(8000, function() {
    console.log("Running and listening on PORT 8000");
  })

  //Sets the route for the home page, logs once in terminal msg, sendFiles of our home.html
  app.get("/", function(req, res) {
    console.log("User requesting/landing on homepage.");
    res.sendFile(__dirname + "/views/home.html");
  });

  //Initializes a session needed for our Twitter oauth
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

  app.get("/successful_login", function(req, res) {
    console.log("Successful user log in");

    console.log("user id = " + useridpass);

    db.collection("users").find( {id: useridpass}).toArray(function(err, result) {
      console.log("result after searching for " + useridpass + ": " + JSON.stringify(result));
      console.log("NAME: " + JSON.stringify(result[0].name));
      userfullname = result[0].name;
      console.log("GENDER: "+ JSON.stringify(result[0].gender));
      usergender = result[0].gender;
      console.log("EMAIL: " + JSON.stringify(result[0].email));
      useremail = result[0].email;
      console.log("PHOTO: " + JSON.stringify(result[0].photo));
      userphoto = result[0].photo;
    });

    res.render(__dirname + "/views/homeUser.ejs", {userfullname, usergender, useremail, userphoto});

  });

  //This is the back-end code for when the user clicks on the "Submit" button
  app.get("/yelpresult", function(req, res) {

    console.log("SEARCH = " + req.query.search);
    console.log("LOCATION = " + req.query.location);

    db.collection("results").find( {queryterm: req.query.search, querylocation: req.query.location}).toArray(function(err, result) {
      if (result != "") {
        console.log("Found!  An entry for THIS query already exists in database.");
        res.render(__dirname + "/views/cachedResult.ejs", {result});
        console.log(result);
      }

      else {

        console.log("IT DOESN'T EXIST!  CALLING YELP API");

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
          MongoDB itself has collections and each collection is its own "database".  So eventually
          we will likely have another db.collection but instead of db.collection("results"), it'd
          probably hvae to be db.collection("users"), which will have a different schema based on what
          we set earlier.
          */
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
          console.log("INSERT SUCCESSFUL");

          //Thus, render this new page, searchResult.ejs, and pass in all these data vars so that we may display
          //them on the front end
          res.render(__dirname + "/views/searchResult.ejs", { result1,rate1,location1, image1,priceRange1,result2,rate2,location2,image2,priceRange2,result3,rate3,location3, image3,priceRange3});


          //Currently not doing anything with reviews, this is just a block of code just to play around with,
          //but it currently doesn't do anything.
          client.reviews(biz_id).then (response => {
            var biz_reviews = response.jsonBody.reviews;

          })

        })

      }

    })

  });

});

// Render button ridirect pages for buzzed, tipsy, drunk, and hammered.

app.get("/buzzed", function(req, res) {

  res.render(__dirname + "/views/drunk_level/buzzed.ejs");

 });

app.get("/tipsy", function(req, res) {

  res.render(__dirname + "/views/drunk_level/tipsy.ejs");

 });

app.get("/drunk", function(req, res) {

  res.render(__dirname + "/views/drunk_level/drunk.ejs");

 });

app.get("/hammered", function(req, res) {

  res.render(__dirname + "/views/drunk_level/hammered.ejs");

 });
