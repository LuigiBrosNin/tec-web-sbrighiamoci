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
const collection_squeals = database.collection(squealCollection);
const collection_channels = database.collection(channelCollection);

/********************** FUNCTIONS **********************/


/* -------------------------------------------------------------------------- */
/*                   /CHANNELS/:NAME/SUBSCRIBERS_NUM                          */
/*                                GET                                         */
/* -------------------------------------------------------------------------- */

//* GET
// return the number of subscribers of a channel
app.get("/channels/:name/subscribers_num", async (req, res) => {
  try {
    const channelName = req.params.name

    await mongoClient.connect()
    const channel = await collection_channels.findOne({ name: channelName })

    if (!channel) {
      res.status(404).json({
        message: "Channel not found."
      });
      return;
    }
    else {
      res.status(200).json(channel.subscribers_num)
    }
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


/* -------------------------------------------------------------------------- */
/*                       /CHANNELS/:NAME/SUBSCRIBERS_LIST                     */
/*                              GET, PUT, DELETE                              */
/* -------------------------------------------------------------------------- */

//* GET
// returns the list of the subscribers of the channel

app.get("/channels/:name/subscribers_list", async (req, res) => {
  try {
  console.log("Benvenuto in quasta nuva get")
    // initializing the start and end index in case they are not specified
    let startIndex = 0;
    let endIndex = 10;

    // check if the parameters are valid
    if (req.query.startindex !== undefined && req.query.startindex !== NaN) {
      startIndex = parseInt(req.query.startindex);
    }
    if (req.query.endindex !== undefined && req.query.endindex !== NaN) {
      endIndex = parseInt(req.query.endindex);
    }
    if (startIndex > endIndex) {
      res.status(400).json({
        message: "startIndex must be less than endIndex."
      });
      return;
    }

    const channelName = req.params.name;

    await mongoClient.connect();

    const channel = await collection_channels.findOne({ name: channelName })
    // if the channel is not found, return 404
    if (channel === null) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    const subscribers = channel.subscribers_list.slice(startIndex, endIndex + 1);
    res.status(200).json(subscribers);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});