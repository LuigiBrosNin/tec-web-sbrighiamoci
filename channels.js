/********************** SETTINGS **********************/

global.rootDir = __dirname;

const {
  parse
} = require("path");
const {
  app
} = require("./index.js");
const {
  typeOfProfile,
  isAuthorizedOrHigher
} = require("./loginUtils.js");
const bodyParser = require('body-parser');
const {
  dbName,
  squealCollection,
  profileCollection,
  channelCollection, 
  mongoClient,
  CM
} = require("./const.js");

// connecting to the database
mongoClient.connect();
const database = mongoClient.db(dbName);
const collection = database.collection(squealCollection);
const collection_channels = database.collection(channelCollection);

/********************** FUNCTIONS **********************/

//  /channels/followersnumber | numero followers
//? id è corretto come parametro per l'API?
app.get("/channels/:name", async (req, res) => {
  try {
    console.log("Sei nel subscribersnum")
    const channelName = req.params.name
    
    await mongoClient.connect()
    const channel = await collection_channels.findOne({ name: channelName })
  console.log("Il canale: " + channel)
    if (!channel) {
      res.status(404).json({
        message: "Channel not found."
      });
      return; 
    }
    else {
      res.status(200).send(channel.subscribers_num)
    }
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});