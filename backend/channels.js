/* -------------------------------- SETTINGS -------------------------------- */

const {
  parse
} = require("path");
const {
  app
} = require("../index.js");
const {
  typeOfProfile,
  isAuthorizedOrHigher,
  isSMMAuthorized
} = require("./loginUtils.js");
const bodyParser = require('body-parser');
const {
  dbName,
  squealCollection,
  profileCollection,
  channelCollection,
  mongoClient,
  CM,
  importPic,
  exportPic
} = require("./const.js");
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage()
});

// connecting to the database
mongoClient.connect();
const database = mongoClient.db(dbName);
const collection_squeals = database.collection(squealCollection);
const collection_channels = database.collection(channelCollection);
const collection_profiles = database.collection(profileCollection);


/* ------------------------------- FUNCTIONS -------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                 /CHANNELS/                                 */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// returns the list of the channels on the database (supports pagination & queries)
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

    let search = {
      is_deleted: false
    };
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
/*                            GET, PUT, POST, DELETE                          */
/* -------------------------------------------------------------------------- */

//* GET
// returns the channel with the specified name

app.get("/channels/:name", async (req, res) => {
  try {
    const channelName = req.params.name;

    await mongoClient.connect();
    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "The channel does not exist."
      });
    } else {
      res.status(200).json(channel);
    }

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


//* PUT
// creates a new channel with the specified name
// body parameters: owner, bio (users)
// body parameters: type (only admins)
app.put("/channels/:name", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = isAuthorizedOrHigher(req.session.user, typeOfProfile.user) && req.session.user === req.body.user;
    const adminAuthorized = isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);
    const SMMAuthorized = isSMMAuthorizedMAuthorized(req.session.user, req.body.user);

    if (!authorized && !SMMAuthorized) {
      res.status(401).json({
        message: "Not authorized to create a channel."
      });
      return;
    }

    let channel = {
      name: channelName,
      owner: req.body.user,
      type: "private",
      mod_list: [],
      subscribers_num: 1,
      subscribers_list: [req.body.user],
      squeals_num: 0,
      squeals_list: [],
      propic: null,
      bio: req.body.bio,
      is_deleted: false,
      propic: null
    };

    // only admins can create privileged or required channels
    if (adminAuthorized && (req.body.type === "private" || req.body.type === "privileged" || req.body.type === "required")) {
      channel.type = req.body.type;
    }

    // if type = private, set name to all lowercase
    if (channel.type === "private") {
      channel.name = channel.name.toLowerCase();
    } else if (channel.type === "privileged" || channel.type === "required") {
      channel.name = channel.name.toUpperCase();
    }

    // check if there is another channel with the same name, in that case deny the creation
    const already_taken = await collection_channels.findOne({
      name: channel.channelName
    })
    if (already_taken !== null) {
      res.status(409).json({
        message: "Name already taken."
      });
      return;
    }

    await mongoClient.connect();
    const result = await collection_channels.insertOne(channel);

    res.status(200).json({
      message: "Channel created."
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

//* POST
// updates the channel with the specified name
// body parameters: user, bio (users)
app.post("/channels/:name", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = isAuthorizedOrHigher(req.session.user, typeOfProfile.user) && req.session.user === req.body.user;
    const SMMAuthorized = isSMMAuthorized(req.session.user, req.body.user);

    const bio = req.body.bio;

    if (bio == null) {
      res.status(400).json({
        message: "bio cannot be null"
      });
      return;
    }

    if (!authorized && !SMMAuthorized) {
      res.status(401).json({
        message: "Not authorized to modify this channel."
      });
      return;
    }

    await mongoClient.connect();
    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "Channel not found."
      });
      return;
    }

    let mod_auth = false;

    for (const mod of channel.mod_list) {
      if (mod == req.body.user) {
        mod_auth = true;
        break;
      }
    }

    if (channel.owner == req.body.user) {
      mod_auth = true;
    }

    if (!mod_auth) {
      res.status(401).json({
        message: "not authorized to modify this channel's propic (not valid mod)"
      });
      return;
    }

    await mongoClient.connect();
    const result = await collection_channels.updateOne({
      name: channelName
    }, {
      $set: {
        bio: bio
      }
    });

    if (result.modifiedCount === 0) {
      res.status(404).json({
        message: "Channel not found."
      });
      return;
    }

    res.status(200).json({
      message: "Channel updated successfully."
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


//* DELETE
// deletes the channel with the specified name
app.delete("/channels/:name", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    await mongoClient.connect();
    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (!authorized && channel.owner !== req.session.user) {
      res.status(401).json({
        message: "Not authorized to delete this channel."
      });
      return;
    }

    await mongoClient.connect();
    const result = await collection_channels.updateOne({
      name: channelName
    }, {
      $set: {
        owner: "",
        mods_list: [],
        squeals_list: [],
        subscribers_list: [],
        subscribers_num: 0,
        rules: [],
        propic: "",
        bio: "",
        is_deleted: true
      }
    });

    if (result.modifiedCount === 0) {
      res.status(404).json({
        message: "Channel not found or no modifications were made."
      });
      return;
    }

    res.status(200).json({
      message: "Channel deleted successfully."
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

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "The channel does not exist."
      });
      return;
    }

    res.status(200).json(channel.subscribers_num)

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


/* -------------------------------------------------------------------------- */
/*                       /CHANNELS/:NAME/SUBSCRIBERS_LIST                     */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// returns the list of the subscribers of the channel

app.get("/channels/:name/subscribers_list", async (req, res) => {
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

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "The channel does not exist."
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

/* USELESS AND REDUNDANT
//* PUT
// add a subscriber to the channel, or remove it if already subscribed
app.put("/channels/:name/subscribers_list", async (req, res) => {
  try {
    let authorized = true; //TODO add authorization

    if (!authorized) {
      res.status(401).json({
        message: "Not authorized to modify this channel's subscriber list"
      });
      return;
    }

    const req_user = req.session.user; //! non testato con login, fonte di potenziali errori
    const channelName = req.params.name;

    // retrieve user and channel
    await mongoClient.connect();

    const user = await collection_profiles.findOne({
      name: req_user
    })
    if (user === null || user.is_deleted) {
      res.status(404).json({
        message: "User not found."
      });
      return;
    }

    const channel = await collection_channels.findOne({
      name: channelName
    })

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "The channel does not exist."
      });
      return;
    }

    // find out if the user is already subscribed
    const subscribersList = channel.subscribers_list;
    let subscribed = false;
    for (const reply of subscribersList) {
      if (reply === user.name) {
        subscribed = true;
        break;
      }
    }

    // if the user is already subscribed, remove follow from channel (update both lists: on profile and channel)
    // if not subscribed, add follow 
    if (subscribed) {

      await collection_channels.updateOne({
        name: channel.name
      }, {
        $pull: {
          subscribers_list: user.name
        },
        $inc: {
          subscribers_num: -1
        }
      });

      await collection_profiles.updateOne({
        name: user.name
      }, {
        $pull: {
          following_list: channel.name
        }
      });
      res.status(200).json({
        message: "User unsubscribed successfully."
      })
    } else {
      await collection_channels.updateOne({
        name: channel.name
      }, {
        $addToSet: {
          subscribers_list: user.name
        },
        $inc: {
          subscribers_num: 1
        }
      });
      await collection_profiles.updateOne({
        name: user.name
      }, {
        $addToSet: {
          following_list: channel.name
        }
      });
      res.status(200).json({
        message: "User subscribed successfully."
      })
    }
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});*/

/* -------------------------------------------------------------------------- */
/*                         /CHANNELS/:NAME/MOD_LIST                           */
/*                               PUT, DELETE                                  */
/* -------------------------------------------------------------------------- */

//* PUT
// adds a moderator to the channel
// body parameters: mod_name (string)
app.put("/channels/:name/mod_list", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION

    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "Channel not found."
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

    if (profile.is_deleted || profile === null) {
      res.status(404).json({
        message: "profile not found."
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
app.delete("/channels/:name/mod_list", async (req, res) => {
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

    if (!authorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's mod_list"
      });
      return;
    }

    const updated_list = channel.mod_list.filter(mod => mod !== req.body.mod_name);

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

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "Channel not found."
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
app.put("/channels/:name/squeals_list", async (req, res) => {
  try {
    const name = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION
    const adminAuthorized = true //TODO ADD AUTHORIZATION

    console.log("enter channel put " + req.body.squeal_id);

    const channel = await collection_channels.findOne({
      name: name
    });

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "Channel not found."
      });
      console.log("channel not found");
      return;
    }

    if (!authorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's squeals_list"
      });
      return;
    }

    if (!adminAuthorized && (channel.type === "required" || channel.type === "privileged")) {
      res.status(401).json({
        message: "not authorized to modify this channel's squeals_list: not an admin"
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
      console.log("squeal not found");
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

    res.status(200).json({
      message: "squeal added"
    });

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
app.delete("/channels/:name/squeals_list", async (req, res) => {
  try {
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

    const updated_list = channel.mod_list.filter(mod => mod !== req.body.mod_name);

    await mongoClient.connect();
    const result = await collection_channels.updateOne({
      name: name
    }, {
      $set: {
        squeals_list: updated_list
      }
    });

    if (result.modifiedCount === 0) {
      res.status(404).json({
        message: "channel/squeal not found"
      });
      return;
    }

    res.status(200).json({
      message: "squeal removed"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                             /CHANNELS/:NAME/PROPIC                         */
/*                               GET, PUT, DELETE                             */
/* -------------------------------------------------------------------------- */

//* GET
// returns the propic of the channel
app.get("/channels/:name/propic", async (req, res) => {
  try {
    const channelName = req.params.name;

    await mongoClient.connect();
    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "The channel does not exist."
      });
      return;
    }

    exportPic(channel.propic, res);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

//* PUT
// sets the propic of the channel
// body parameters: user, propic (file)
//TODO ADD AUTHORIZATION (ADMIN OR OWNER)
app.put("/channels/:name/propic", upload.single('file'), async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION
    const SMMAuthorized = isSMMAuthorized(req.session.user, req.body.user);


    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "Channel not found."
      });
      return;
    }

    if (!authorized && !SMMAuthorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's propic (not valid user)"
      });
      return;
    }

    let mod_auth = false;

    for (const mod of channel.mod_list) {
      if (mod === req.body.user) {
        mod_auth = true;
        break;
      }
    }

    if (channel.owner == req.body.user) {
      mod_auth = true;
    }

    if (!mod_auth) {
      res.status(401).json({
        message: "not authorized to modify this channel's propic (not valid mod)"
      });
      return;
    }

    const pic = req.body.propic;

    if (!importPic(pic, channelName, collection_channels)) {
      res.status(500).json({
        message: "Error uploading the propic."
      });
      return;
    }

    res.status(200).json({
      message: "propic updated"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

//* DELETE
// deletes the propic of the channel
// body: user
//TODO ADD AUTHORIZATION (ADMIN OR OWNER)
app.delete("/channels/:name/propic", async (req, res) => {
  try {
    const channelName = req.params.name;
    const authorized = true //TODO ADD AUTHORIZATION
    const SMMAuthorized = isSMMAuthorized(req.session.user, req.body.user);

    const channel = await collection_channels.findOne({
      name: channelName
    });

    if (channel.is_deleted || channel === null) {
      res.status(404).json({
        message: "Channel not found."
      });
      return;
    }

    if (!authorized && !SMMAuthorized) {
      res.status(401).json({
        message: "not authorized to modify this channel's propic"
      });
      return;
    }

    let mod_auth = false;

    for (const mod of channel.mod_list) {
      if (mod == req.body.user) {
        mod_auth = true;
        break;
      }
    }

    if (channel.owner == req.body.user) {
      mod_auth = true;
    }

    if (!mod_auth) {
      res.status(401).json({
        message: "not authorized to modify this channel's propic (not valid mod)"
      });
      return;
    }

    await mongoClient.connect();
    const result = await collection_channels.updateOne({
      name: channelName
    }, {
      $set: {
        propic: null
      }
    });

    if (result.modifiedCount == 0) {
      res.status(404).json({
        message: "channel not found"
      });
      return;
    }

    res.status(200).json({
      message: "propic deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});