// database constants
/* SEZIONE MONGODB ALEX */
const { MongoClient } = require("mongodb");
const mongouri = `mongodb://site222326:ui9aeG5f@mongo_site222326?writeConcern=majority`;
const mongoClient = new MongoClient(mongouri);
/* FINE SEZIONE MONGODB ALEX */

const dbName = "SquealerDB";
const squealCollection = "Squeals";
const profileCollection = "Profiles";

const CM = 0.25;

module.exports = {dbName, squealCollection, profileCollection, mongoClient, CM};