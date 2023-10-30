// database constants
/* SEZIONE MONGODB ALEX */
const { MongoClient } = require("mongodb");
const mongouri = `mongodb://site222326:ui9aeG5f@mongo_site222326?writeConcern=majority`;
const mongoClient = new MongoClient(mongouri);
/* FINE SEZIONE MONGODB ALEX */

const dbName = "SquealerDB";
const squealCollection = "Squeals";
const profileCollection = "Profiles";
const channelCollection = "Channels";
const automaticPostsCollection = "AutomaticPosts";

// interval for periodical posts
const interval = 10000 // 10 seconds
//1000 * 60 * 60; // 1 hour

const CREDIT_LIMITS = [150, 500, 1000];

const CM = 0.25;

module.exports = {dbName, squealCollection, profileCollection, channelCollection, automaticPostsCollection, mongoClient, interval, CREDIT_LIMITS, CM};