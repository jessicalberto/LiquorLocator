# CS411Group7
CS 411 - Group 7 Project - Website Application

This is Group 7's GitHub repository for our final project. 

Our website application will be any college kid’s ideal, all-inclusive app for a night out. Ideally, the site will have a selection page for the user to pick how drunk he or she would like to get that night: ranging from buzzed, drunk, very drunk, black-out, or not drunk at all. Based on that selection, the website will then display certain drinks and quantities that would be best for the user to achieve the desired level of drunkenness, plus a potential cost the user will spend that night based on the drinks they choose. (costs drawn from local grocery stores, Target API, etc.) After this, the user will be able to enter their location. At a high level, we then draw from the google map APIs which show bars in a 0.5 mile - 1 mile radius of the route between the two points. We then look at the bars generated and use the google data for most popular hours, and a Yelp API to get data for which bars are the busiest and most favorably review. We then output the bar route that would be most optimal for a bar crawl. 

Notes: 
master branch -- final demonstration development <br/>
APIbranch -- API developer branch <br/>


<!-- Updated description on 4/28 -->

Our website application serves as "a BU student’s ideal, all-inclusive app for a night out".  The website requires login through Facebook authentication.  After successfully logging in, the user is taken to a page where they are presented with the two functionalities of the app.  1) They can select how drunk he or she would like to get that night, from buzzed (light), tipsy, drunk, and then hammered.  The user enters in their weight for an accurate estimate of how many drinks he or she will need as a baseline, although actual results will vary depending on their prior experience and built-up alcohol tolerance. 2) Thanks to Facebook login, the user doesn't have to enter in redundant inputs like their gender, as the website will already know and store that data.  That gives them an even more accurate estimate of how many drinks he or she may need (as the #s of drink change based on weight && gender).  The website also tells them recommended drinks to achieve that level of drunkeness, i.e like Jagermeister for the most severe case of drunkness.  3) The user can use the other feature to search for local bars around their location that offer the drinks they're looking for.  This uses the Yelp API in conjunction with the Google Maps API, as we offer the top 3 results, their Yelp details, along with immediate directions (walking) on how to get those places from where they live on campus.  The Google Maps naturally optimizes for one route amongst all 3 locations as directions for a true "bar crawl."

