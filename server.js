//Dependencies
var twitter = require('ntwitter');
var util = require('util');
var credentials = require('./credentials.js');
var cloudinary = require('cloudinary');
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var moment = require('moment'); 
    
// Twitter Stream Topics
var trackedTags = ['#selfie']; // topics

// oauth twitter client
var twit = new twitter({
  		consumer_key: credentials.consumer_key,
  		consumer_secret: credentials.consumer_secret,
  		access_token_key: credentials.access_token_key,
  		access_token_secret: credentials.access_token_secret
});

//cloudniary API keys
cloudinary.config({ 
  cloud_name: 'replayfx', 
  api_key: '286445638368727', 
  api_secret: '9exIU9hCrBnUas3akRjmcMKO7jA' 
});

//upload images to cloudinary                            
cloudinary.image("http://upload.wikimedia.org/wikipedia/commons/4/45/Spain_national_football_team_Euro_2012_final.jpg", {overlay: "glasses", gravity: "faces", width: 30, type: "fetch"})















// MongoDB Client Connection - To your Local or remote MongoDB Database
// NOTE: The name is at the end of the connection : streamland
MongoClient.connect('mongodb://fxadmin:Password1@ds133231.mlab.com:33231/replaytweets', function(err, db) {
    if(err) {console.log(err);}     
    
    // create mongodb collection
    var collection = db.collection('fxtweets');

	  	
    // outside loop into stream
    twit.stream('statuses/filter',  { track: trackedTags}, function(stream) {
            // console.log(trackedTags);
            stream.on('data', function (data) {
                // look for your topic, write that tweet to mongodb
                trackedTags.forEach(function (trackedTags) {
                    //run RegEx on parameters to replace illegal characters.
                        var myRegExp = new RegExp(trackedTags)
                        //if text matches our input topics AND contains media
                        if (data.text.match(myRegExp) && data.entities.media != null) {
                            console.log(data);
                            console.log(data.entities.media[0].media_url)
                            



                        // insert mongodb record

                        collection.insert({'postDT': moment().format('MM-DD-YYYY HH:MM'), // GEO?
                                           'tweetID': data.id_str,
                                           'userID': data.user.id_str,
                                           'userName': data.user.screen_name, 
                                           'userImage': data.user.profile_image_url,
                                           'tweetImage': data.entities.media[0].media_url,
                                           'tweetText': data.text}, function(err, result) {
                                   if (err) { console.log(err);}
                        });
                        //
                        console.log("TWEET CAPTURED! " + moment().format('MM-DD-YYYY HH:MM') +" From: "+ data.user.screen_name);    
                        //
                        } 
                 });
            });
    });
});
//
//
