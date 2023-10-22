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
const collection_profiles = database.collection(profileCollection);

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
// NOTE: private channels do not appear in searches, even if you're the owner
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
/*                               /CHANNELS/:NAME                              */
/*                               GET, PUT, DELETE                             */
/* -------------------------------------------------------------------------- */

//* GET
// returns the channel with the specified name

app.get("/channels/:name", async (req, res) => {
  try{
    const channelName = req.params.name;

    await mongoClient.connect();
    const channel = await collection_channels.findOne({ name: channelName });

    if (channel === null) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    res.status(200).json(channel);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

});

//* PUT
// creates a new channel with the specified name
// body parameters: propic, bio (users)
// body parameters: type, rules (array of strings) (only admins)

//TODO ADD AUTHORIZATION
app.put("/channels/:name", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    let channel = {
      name: channelName,
      owner: req.session.user,
      type: "private",
      mod_list: [req.session.user],
      subscribers_num: 1,
      subscribers_list: [req.session.user],
      squeals_num: 0,
      squeals_list: [],
      propic: req.body.propic,
      bio: req.body.bio
    };


    if (authorized) {
      channel.rules = req.body.rules;
      type = req.body.type;
    }

    await mongoClient.connect();
    const result = await collection_channels.insertOne(channel);

    res.status(200).json({
      message: "channel created"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

//* DELETE
// deletes the channel with the specified name
//TODO ADD AUTHORIZATION (ADMIN OR OWNER)
app.delete("/channels/:name", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    await mongoClient.connect();
    const channel = await collection_channels.findOne({ name: channelName });

    if (!authorized && channel.owner !== req.session.user) {
      res.status(401).json({
        message: "not authorized to delete this channel"
      });
      return;
    }

    await mongoClient.connect();
    const result = await collection_channels.deleteOne({
      name: channelName
    });

    if (result.deletedCount === 0) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    res.status(200).json({
      message: "channel deleted"
    });

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

/* -------------------------------------------------------------------------- */
/*                           /CHANNELS/:NAME/RULES                            */
/*                             GET, PUT, DELETE                               */
/* -------------------------------------------------------------------------- */

//* GET
// returns the rules of the channel
app.get("/channels/:name/rules", async (req, res) => {
  try {
    const channelName = req.params.name;

    await mongoClient.connect();
    const channel = await collection_channels.findOne({ name: channelName });

    if (channel === null) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    res.status(200).json(channel.rules);
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});



//* PUT
// updates the rules of the channel
// body parameters: rules (array of strings), has to be complete, as the old list will be overwritten
//TODO ADD AUTHORIZATION (ADMIN OR OWNER)
app.put("/channels/:name/rules", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (!authorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's rules"
      });
      return;
    }

    await mongoClient.connect();
    const result = await collection_channels.updateOne({
      name: channelName
    }, {
      $set: {
        rules: req.body.rules
      }
    });

    if (result.modifiedCount === 0) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    res.status(200).json({
      message: "rules updated"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

//* DELETE
// deletes the rules of the channel
//TODO ADD AUTHORIZATION (ADMIN OR OWNER)
app.delete("/channels/:name/rules", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (!authorized) {
      res.status(401).json({
        message: "not authorized to delete this channel's rules"
      });
      return;
    }

    await mongoClient.connect();
    const result = await collection_channels.updateOne({
      name: channelName
    }, {
      $set: {
        rules: []
      }
    });

    if (result.modifiedCount === 0) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    res.status(200).json({
      message: "rules deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                         /CHANNELS/:NAME/MOD_LIST                           */
/*                               PUT, DELETE                                  */
/* -------------------------------------------------------------------------- */

//* PUT
// adds a moderator to the channel
// body parameters: mod_name (string)
//TODO ADD AUTHORIZATION (ADMIN OR OWNER)
//TODO TEST
app.put("/channels/:name/mod_list", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    const channel = await collection_channels.findOne({
      name: channelName
    });


    if (channel === null) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    if (channel.mod_list.includes(req.body.mod_name)) {
      res.status(400).json({
        message: "moderator already in the list"
      });
      return;
    }

    if (!authorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's mod_list"
      });
      return;
    }


    await mongoClient.connect();
    const profile = await collection_profiles.findOne({
      name: req.body.mod_name
    });

    if (profile === null) {
      res.status(404).json({
        message: "profile not found"
      });
      return;
    }

    const result = await collection_channels.updateOne({
      name: channelName
    }, {
      $push: {
        mod_list: req.body.mod_name
      }
    });

    if (result.modifiedCount === 0) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    res.status(200).json({
      message: "moderator added"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

//* DELETE
// removes a moderator from the channel
// body parameters: mod_name (string)
//TODO ADD AUTHORIZATION (ADMIN OR OWNER)
//TODO TEST
app.delete("/channels/:name/mod_list", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    const channel = await collection_channels.findOne({
      name: channelName
    });

    if(channel === null){
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    if (!authorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's mod_list"
      });
      return;
    }

    const updated_list = channel.mod_list.pull(req.body.mod_name);

    const result = await collection_channels.updateOne({
      name: channelName
    }, {
      $set: {
        mod_list: updated_list
      }
    });

    if (result.modifiedCount === 0) {
      res.status(404).json({
        message: "moderator not in the list"
      });
      return;
    }

    res.status(200).json({
      message: "moderator removed"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                        /CHANNELS/:NAME/SQUEALS_LIST                        */
/*                             GET, PUT, DELETE                               */
/* -------------------------------------------------------------------------- */

//* GET
// returns the list of the squeals of the channel
// supports pagination
// parameters: startindex, endindex
app.get("/channels/:name/squeals_list", async (req, res) => {
  try {
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

    const squeals = channel.squeals_list.slice(startIndex, endIndex + 1);
    res.status(200).json(squeals);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

//* PUT
// adds a squeal to the channel
// body parameters: squeal_id (string)
//TODO ADD AUTHORIZATION (ADMIN OR OWNER OR USER)
//TODO TEST
app.put("/channels/:name/squeals_list", async (req, res) => {
  try{
    const name = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    const channel = await collection_channels.findOne({
      name: name
    });

    if (!authorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's squeals_list"
      });
      return;
    }

    const squeal = await collection_squeals.findOne({
      id: req.body.squeal_id
    });

    if (squeal === null) {
      res.status(404).json({
        message: "squeal not found"
      });
      return;
    }

    channel.squeals_list.push(req.body.squeal_id);

    await mongoClient.connect();
    const result = await collection_channels.updateOne({
      name: name
    }, {
      $set: {
        squeals_list: channel.squeals_list
      }
    });

    res.status(200).json({ message: "squeal added" });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

//* DELETE
// removes a squeal from the channel
// body parameters: squeal_id (string)
//TODO ADD AUTHORIZATION (ADMIN OR OWNER OR MOD)
//TODO TEST
app.delete("/channels/:name/squeals_list", async (req, res) => {
  try{
    const name = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    const channel = await collection_channels.findOne({
      name: name
    });

    if (!authorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's squeals_list"
      });
      return;
    }

    const squeal = await collection_squeals.findOne({
      id: req.body.squeal_id
    });

    if (squeal === null) {
      res.status(404).json({
        message: "squeal not found"
      });
      return;
    }

    channel.squeals_list.pull(req.body.squeal_id);

    await mongoClient.connect();
    const result = await collection_channels.updateOne({
      name: name
    }, {
      $pull: {
        squeals_list: req.body.squeal_id
      }
    });

    if (result.modifiedCount === 0) {
      res.status(404).json({
        message: "channel/squeal not found"
      });
      return;
    }

    res.status(200).json({ message: "squeal removed" });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
