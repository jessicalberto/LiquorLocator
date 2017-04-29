# CS411 - Software Engineering: The Liquor Locator
CS 411 - Group 7 Project - Website Application

This is Group 7's GitHub repository for our final project. 
<!-- Updated description on 4/28 -->

# Features
Our website application serves as "a BU student’s ideal, all-inclusive app for a night out".  The website requires login through third-party Facebook authentication.  After successfully logging in, the user is taken to our home page where they are presented with main functionalities of the app: decide what drinks to consume, and show where to find them.
* 1) They can select how drunk he or she would like to get that night, from buzzed (light), tipsy, drunk, and then hammered.  The user enters in their weight for an accurate estimate of how many drinks he or she will need as a baseline, although actual results will vary depending on their prior experience and built-up alcohol tolerance. 
* 2) Thanks to the Facebook login, the user doesn't have to enter in redundant inputs like their gender, as the app will know and store that data.  This gives them an even more accurate estimate of how many drinks he or she may need (as the #s of drink change based on weight && gender).  The website also tells them recommended drinks to achieve that level of drunkeness, i.e like Jagermeister or Tequila for the most severe case of drunkness.  
* 3) The user can use our final bar crawl feature to search for local bars around their location that offer the drinks they're looking for.  This uses the Yelp API in conjunction with the Google Maps API, as we offer the top 3 results, their Yelp details, along with immediate directions (walking) on how to get those places from where they live on campus.  The Google Maps naturally optimizes for one route amongst all 3 locations as directions for a true "bar crawl."

# Preview
![alt text](http://i347.photobucket.com/albums/p449/shawtyjesshhicuhh/lqrlctr_zpszpocunku.png)

# Requirements
1)  Node - to check, type node --version into console.  Otherwise, you can download Node here: https://nodejs.org/en/download/
2)  Internet browser (Safari, Chrome, IE, Firefox, etc...)
3)  An open PORT 8000 for the app to run in
4)  Facebook account for logging in/accessing app functionality

# How to Deploy
1) Clone/download LiquorLocator as zip or onto your desktop.
2) cd into the main LiquorLocator directory via your CLI
3) Type "node server.js" into your CL
4) You should see verification via CLI printout statements that the app is up and running.
5) Open up your internet browser of choice and go to http://localhost:8000

