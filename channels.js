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
/*                                 /CHANNELS/                                 */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// returns the list of the channels
// supports pagination & queries
// parameters: startindex, endindex, name, owner, type (privileged, private)
// GTE prameters: subscribers_num
app.get("/channels", async (req, res) => {
  try {

    // initializing the start and end index in case they are not specified
    let startIndex = 0;
    let endIndex = 10;
    // check if the parameters exist
    if (req.query.startindex !== undefined && req.query.startindex !== NaN) {
      startIndex = parseInt(req.query.startindex);
    }
    if (req.query.endindex !== undefined && req.query.endindex !== NaN) {
      endIndex = parseInt(req.query.endindex);
    }
    // check if indexes are valid
    if (startIndex > endIndex) {
      res.status(400).json({
        message: "startIndex must be less than endIndex"
      });
      return;
    }

    let search = {};
    const possibleParams = ["name", "owner", "type"];

    for (const param of possibleParams) {
      if (req.query[param] !== undefined) {
        search[param] = req.query[param];
      }
    }

    // check number of subscribers request
    if (req.query.subscribers_num !== undefined && req.query.subscribers_num !== NaN) {
      search.subscribers_num = {
        $gte: parseInt(req.query.subscribers_num)
      };
    }

    await mongoClient.connect();
    const channels = await collection_channels.find(search)
      .sort({
        timestamp: -1
      }) // ordered inverse chronological order
      .skip(startIndex) // starting from startIndex
      .limit(endIndex) // returns endIndex squeals
      .toArray(); // returns the squeals as an array

    res.status(200).json(channels);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                       /CHANNELS/:NAME/SUBSCRIBERS_NUM                      */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

//* GET
// return the number of subscribers of a channel
app.get("/channels/:name/subscribers_num", async (req, res) => {
  try {
    const channelName = req.params.name

    await mongoClient.connect()
    const channel = await collection_channels.findOne({
      name: channelName
    })

    if (!channel) {
      res.status(404).json({
        message: "Channel not found."
      });
      return;
    } else {
      res.status(200).json(channel.subscribers_num)
    }
  } catch (error) {
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

    const channel = await collection_channels.findOne({
      name: channelName
    })
    // if the channel is not found, return 404
    if (channel === null) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    const subscribers = channel.subscribers_list.slice(startIndex, endIndex + 1);
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/*
tra l'altro, il profilo da cui rimuovere come lo prendo? deve essere loggato, ma come lo prendo?
Req.session.user


Per testarlo passalo dal body  E fai req.body.user
Così non serve il login per testare 
*/

//* PUT
// returns the list of the subscribers of the channel
//TODO aggiungere anche ai following dell'utente il canale
app.put("/channels/:name/subscribers_list", async (req, res) => {
  /*
    ottenere l'utente
    ottenere il canale
    controllare se canale esiste
    controllare se l'utente è già iscritto
      se così, disiscriverlo (togliere da subscriber_list, e andare sul suo profilo a rimuovergli il follow)
    se non è iscritto
      iscriverlo (aggiungerlo a subscribers_list e andare nel suo profilo ad aggiungere il follow)
  */
  try {

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});