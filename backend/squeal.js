const {
    app
} = require("../index.js");
const {
    typeOfProfile,
    isAuthorizedOrHigher,
    isSMMAuthorized
} = require("./loginUtils.js");
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer(
    {
        storage: multer.memoryStorage(),
    }
);

const axios = require('axios');
const tough = require('tough-cookie');
const {wrapper} = require('axios-cookiejar-support');
const { CookieJar } = tough;
const cookieJar = new CookieJar();
wrapper(axios);
axios.defaults.jar = cookieJar;
axios.defaults.withCredentials = true;

const {
    dbName,
    squealCollection,
    profileCollection,
    channelCollection,
    mongoClient,
    CM,
    importPic,
    exportPic,
    deletePic
} = require("./const.js");

const authData = {
    // Provide authentication data
    username: "SquealerTechnician",
    password: "tecpw"
};

// connecting to the database
mongoClient.connect();
const database = mongoClient.db(dbName);
const collection_squeals = database.collection(squealCollection);
const collection_profiles = database.collection(profileCollection);
const collection_channels = database.collection(channelCollection);

/* -------------------------------------------------------------------------- */
/*                                 /SQUEALS/                                  */
/*                                 GET & PUT                                  */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna una lista di squeal del database, da startindex ad endindex

// Author, popularity , end_date, start_date, positive_reactions, negative_reactions, impressions
// receiver (group), keywords, mentions, is_private
app.get("/squeals/", async (req, res) => {
    try {
        // initializing the start and end index in case they are not specified
        let startIndex = 0;
        let endIndex = 10;
        // check if the parameters are valid
        if (req.query.startindex !== undefined && !isNaN(req.query.startindex)) {
            startIndex = parseInt(req.query.startindex);
        }
        if (req.query.endindex !== undefined && !isNaN(req.query.endindex)) {
            endIndex = parseInt(req.query.endindex);
        }
        // check if the parameters are valid
        if (startIndex > endIndex) {
            res.status(400).json({
                message: "startIndex must be less than endIndex"
            });
            return;
        }

        console.log('Start Index:', startIndex);
        console.log('End Index:', endIndex);

        // initializing the start and end date in case they are not specified
        let start_date = 0;
        let end_date = Date.now();
        // check if the parameters are valid
        if (req.query.start_date !== undefined && !isNaN(req.query.start_date)) {
            start_date = parseInt(req.query.start_date);
        }
        if (req.query.end_date !== undefined && !isNaN(req.query.end_date)) {
            end_date = parseInt(req.query.end_date);
        }
        // check if the parameters are valid
        if (start_date > end_date) {
            res.status(400).json({
                message: "start_date must be less than end_date"
            });
            return;
        }

        // initializing the search object with the date range
        // automatically set to false the is_private field
        let search = {
            date: {
                $gte: start_date,
                $lte: end_date
            },
            is_private: false
        };

        // check if the user is authorized to access private messages
        if (req.query.is_private === "true" || req.query.is_private === true) {
            if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
                search.is_private = true;
            }
            else if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.user)) {
                if (req.params.author == null && req.params.receiver == null) {
                    search.is_private = true;
                    search.$or = [
                        { author: req.session.user },
                        { receiver: req.session.user }
                    ]
                }
                else if (req.session.user === req.params.author || (await isSMMAuthorized(req.session.user, req.params.author) && await isAuthorizedOrHigher(req.params.author, typeOfProfile.user))) {
                    search.is_private = true;
                    //search.author = req.params.author;
                }
                else if (req.session.user === req.params.receiver || (await isSMMAuthorized(req.session.user, req.params.receiver) && await isAuthorizedOrHigher(req.params.receiver, typeOfProfile.user))) {
                    search.is_private = true;
                    //search.receiver = req.params.receiver;
                }
            }
        }



        // possible query params
        const possibleParams = [
            "author",
            "receiver",
            "keywords",
            "mentions"
        ];


        const possibleGTEParams = [
            "positive_reactions",
            "negative_reactions",
            "impressions"
        ];

        const possiblePopularities = ["isPopular", "isUnpopular", "isControversial"];
        const filedsOfPopularities = ["pos_popularity_ratio", "neg_popularity_ratio"]

        // check if the popularity query param is present in the request body
        // if it is, add threshold to the search object, add both if isControversial is requested
        for (i = 0; i < possiblePopularities.length; i++) {
            if (req.query.popularity == possiblePopularities[i] && i != 2) {
                search[filedsOfPopularities[i]] = {
                    $gte: CM
                }
            } else if (req.query.popularity == possiblePopularities[i] && i == 2) {
                search[filedsOfPopularities[0]] = {
                    $gte: CM
                }
                search[filedsOfPopularities[1]] = {
                    $gte: CM
                }
            }
        }

        // check if any of the possible query params are present in the request body
        // that have to be assigned a $gte operator
        for (const field of possibleGTEParams) {
            if (req.query[field] !== undefined && req.query[field] !== NaN) {
                search[field] = {
                    $gte: parseInt(req.query[field])
                }
            }
        }

        // check if any of the possible query params are present in the request body
        for (const field of possibleParams) {
            if (req.query[field] !== undefined && req.query[field] != "") {
                let tmp = req.query[field];
                search[field] = tmp;
            }
        }

        console.log('Search:', JSON.stringify(search));


        await mongoClient.connect();
        const squeals = await collection_squeals.find(search)
            .sort({
                date: -1
            }) // ordered inverse chronological order
            .skip(startIndex) // starting from startIndex
            .limit(endIndex - startIndex + 1) // returns endIndex squeals
            .toArray(); // returns the squeals as an array

        res.status(200).json(squeals); // returns the squeals

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
})

//* PUT
// aggiunge/sovrascrive uno squeal al database (è impossibile sovrascrivere in quanto l'id è generato progressivamente)
// nome utente + numero squeals = ID
// required: author, text, receiver, is_private
// optional: media, reply_to
app.put("/squeals/", upload.single('file'), bodyParser.urlencoded({
    extended: true
}), async (req, res) => {
    try {
        const reqBody = JSON.parse(req.body.json);

        const media = req.file;

        console.log("media: " + media)

        const location = reqBody.location;

        if (reqBody.author == null) {
            reqBody.author = req.session.user;
        }

        const requiredFields = [
            "author",
            "text",
            "receiver"
        ];

        // Check if all required fields are present in the request body
        for (const field of requiredFields) {
            if (reqBody[field] == null || reqBody[field] === "" || (typeof reqBody[field] != "string")) {
                res.status(400).json({
                    message: `${field} is required and has to be valid`
                });
                return;
            }
        }
        // If all required fields are present, continue with the insertion


        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);
        const authorized = await isAuthorizedOrHigher(reqBody["author"], typeOfProfile.user) && req.session.user === reqBody["author"];
        const SMMAuthorized = await isSMMAuthorized(req.session.user, reqBody["author"]) && await isAuthorizedOrHigher(reqBody["author"], typeOfProfile.user);

        if (!authorized && !SMMAuthorized && !adminAuthorized) {
            res.status(401).json({
                message: "you must be logged in to add a squeal"
            });
            return;
        }

        // defining the required fields as well as initializing the standard fields
        let newSqueal = {
            id: "",
            author: reqBody.author,
            text: reqBody.text,
            receiver: reqBody.receiver,
            date: Date.now(),
            positive_reactions: 0,
            positive_reactions_list: [],
            negative_reactions: 0,
            negative_reactions_list: [],
            replies_num: 0,
            replies: [],
            impressions: 0,
            is_private: false,
            mentions: [],
            channel_mentions: [],
            keywords: [],
            reply_to: "",
            media: "",
            location: {}
        }

        // checking boolean separately because in optionalFields it would be seen as string
        if (reqBody.is_private === "true" || reqBody.is_private === true) {
            newSqueal.is_private = true;
        }

        const optionalFields = [
            "reply_to",
            "location"
        ];

        // Check if the optional fields are present in the request body
        // If they are, add them to the newSqueal object
        for (const field of optionalFields) {
            console.log("field: " + field + " body: " + reqBody[field]);
            if (reqBody[field] != null && reqBody[field] != "") {
                newSqueal[field] = reqBody[field];
            }
        }

        const parsed_text = newSqueal.text.split(/(\ |\,|\.|\;|\:|\?|\!|\n)/g);

        for (const word of parsed_text) {
            if (word[0] === "#") {
                newSqueal.keywords.push(word);
            } else if (word[0] === "@") {
                newSqueal.mentions.push(word);
            } else if (word[0] === "§") {
                newSqueal.channel_mentions.push(word);
            }
        }

        let char_cost = newSqueal.text.length;

        // if the media field is present, calculate the cost of the media
        if (media != null) {
            char_cost += 125;
        }

        if (location != null && location != {}) {
            char_cost += 125;
        }

        await mongoClient.connect();

        const profile_author = await collection_profiles.findOne({
            name: newSqueal.author
        });

        if (newSqueal.is_private == true || newSqueal.is_private == "true") {
            const profile_receiver = await collection_profiles.findOne({
                name: newSqueal.receiver
            });

            if (profile_receiver == null) {
                res.status(400).json({
                    message: "profile receiver does not exist"
                });
                return;
            }
        } else {
            const channel_receiver = await collection_channels.findOne({
                name: newSqueal.receiver
            });

            if (channel_receiver == null) {
                res.status(400).json({
                    message: "channel receiver does not exist"
                });
                return;
            }

            if (channel_receiver.type != "private" && !adminAuthorized) {
                res.status(401).json({
                    message: "you are not authorized to post on this channel"
                });
                return;
            }
            
        }

        console.log("author credit\navailable: g: " + profile_author.credit[0] + " s: " + profile_author.credit[1] + " m: " + profile_author.credit[2] + ")\nrequired: " + char_cost);

        // CREDITS
        // 0 = giorno, 1 = settimana, 2 = mese
        // if the author does not exist, invalid request
        if (profile_author === null) {
            res.status(400).json({
                message: "author does not exist"
            });
            return;
        } // check if the authos has enough credit 
        else if (newSqueal.is_private == false && (profile_author.credit[0] < char_cost || profile_author.credit[1] < char_cost || profile_author.credit[2] < char_cost) && !(await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin))) {
            res.status(400).json({
                message: "author does not have enough credit. available (g: " + profile_author.credit[0] + " s: " + profile_author.credit[1] + " m: " + profile_author.credit[2] + ") required: " + char_cost
            });
            return;
        }
        // if the author exists, update the number of squeals, the list of squeals and it's credit
        const squeals_num = parseInt(profile_author.squeals_num) + 1;
        const squeals_list = profile_author.squeals_list;

        let g, s, m;

        // if the author is an admin, don't subtract the credit
        if (adminAuthorized || newSqueal.is_private == true) {
            console.log("admin");
            g = profile_author.credit[0];
            s = profile_author.credit[1];
            m = profile_author.credit[2];
        } else if (newSqueal.is_private == false) {
            console.log("not admin");
            g = profile_author.credit[0] - char_cost;
            s = profile_author.credit[1] - char_cost;
            m = profile_author.credit[2] - char_cost;
        }


        console.log("g: " + g + " s: " + s + " m: " + m);

        // update the author's squeals_num and squeals_list
        newSqueal.id = `${squeals_num}-${profile_author.name}`;

        // adds the new squeal to the list of squeals
        squeals_list.push(newSqueal.id);


        await mongoClient.connect();

        if (newSqueal.reply_to != null && newSqueal.reply_to != "") {
            // retrieve the squeal that is being replied to
            const squeal_replied_to = await collection_squeals.findOne({
                id: newSqueal.reply_to
            });

            // if the squeal is not found, return 404
            if (squeal_replied_to === null) {
                res.status(400).json({
                    message: "the squeal you are replying to does not exist"
                });
                return;
            }

            // if the squeal is found, update the replies_num
            const replies_num = squeal_replied_to.replies_num + 1;

            // update the list of replies
            const replies_list = squeal_replied_to.replies;
            replies_list.push(newSqueal.id);

            // update the squeal_replied_to's replies_num
            await collection_squeals.updateOne({
                id: squeal_replied_to.id
            }, {
                $set: {
                    replies_num: replies_num,
                    replies: replies_list
                }
            });
        }

        // update the author's squeals_num and squeals_list
        await collection_profiles.updateOne({
            name: profile_author.name
        }, {
            $set: {
                squeals_num: squeals_num,
                squeals_list: squeals_list,
                credit: [
                    g,
                    s,
                    m
                ]
            }
        })

        // Insert the new squeal in the database without converting it to a JSON string
        const result = await collection_squeals.insertOne(newSqueal);

        // Upload media if present
        if (media != null) {

            console.log("media: " + media.originalname);
            const imported = await importPic(media, collection_squeals, newSqueal.id);

            console.log("imported media: " + imported);
        }

        const channel_receiver = await collection_channels.findOne({
            name: newSqueal.receiver
        });

        if (channel_receiver != null && channel_receiver != "") {
            await axios.post('https://site222326.tw.cs.unibo.it/login', authData);

            // add the squeal to the channel's squeals_list
            axios.put("https://site222326.tw.cs.unibo.it/channels/" + channel_receiver.name + "/squeals_list", {
                squeal_id: newSqueal.id
            }).then(response => {
                if (response.status == 200) {
                    console.log("squeal added to channel");
                } else {
                    console.log("response status: " + response.status);

                    axios.delete("https://site222326.tw.cs.unibo.it/squeals/" + newSqueal.id);

                    res.status(500).json({
                        message: "Error adding squeal to channel: " + response.status
                    });
                    return;
                }
            });

        }

        console.log('Squeal successfully uploaded: ', result.insertedId + '\n' + JSON.stringify(newSqueal));
        res.status(200).send(JSON.stringify({
            message: "squeal added successfully with db id:" + result.insertedId,
            squeal_id: newSqueal.id,
        }));
    } catch (error) {
        console.error('Error during squeal upload: ', error);
        res.status(500).send(JSON.stringify({
            message: error.message
        }));
    }
})

/* -------------------------------------------------------------------------- */
/*                                  /FEED/                                    */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna una lista di squeal del database basata sui profili e canali seguiti dall'utente, da startindex ad endindex
// se non specificati ritorna le prime 10
app.get("/feed/", async (req, res) => {
    try {
        const feed_user = req.session.user;

        // initializing the start and end index in case they are not specified
        let startIndex = 0;
        let endIndex = 10;
        // check if the parameters are valid
        if (req.query.startindex !== undefined && !isNaN(req.query.startindex)) {
            startIndex = parseInt(req.query.startindex);
        }
        if (req.query.endindex !== undefined && !isNaN(req.query.endindex)) {
            endIndex = parseInt(req.query.endindex);
        }
        // check if the parameters are valid
        if (startIndex > endIndex) {
            res.status(400).json({
                message: "startIndex must be less than endIndex"
            });
            return;
        }

        console.log('Start Index:', startIndex);
        console.log('End Index:', endIndex);

        // find squeals that belong to required channels
        const required_channels = await database.collection(channelCollection).find({
            type: "required"
        }).toArray();

        // get required channels names
        let required_channels_names = [];
        required_channels.forEach(channel => {
            required_channels_names.push(channel.name);
        });

        console.log('Required Channels:', required_channels_names);

        // if the profile is not found, return only required squeals
        if (feed_user == null || feed_user == "") {
            const feed = await database.collection(squealCollection).find({
                receiver: {
                    $in: required_channels_names
                },
                is_private: false
            }).sort({
                date: -1
            }) // ordered inverse chronological order
                .skip(startIndex) // starting from startIndex
                .limit(endIndex - startIndex + 1) // returns endIndex squeals
                .toArray(); // returns the squeals as an array

            for (const squeal of feed) {
                console.log("id: " + squeal.id)
            }

            res.status(200).json(feed); // returns the squeals
            return;
        }

        await mongoClient.connect();
        // fetching the profile with the given name
        const profile = await collection_profiles.findOne({
            name: feed_user
        });


        if (profile == null || profile.is_deleted == true) {
            res.status(400).json({
                message: "profile does not exist"
            });
            return;
        }

        console.log('following_channels:' + profile.following_channels + "\nfollowing_list: " + profile.following_list);

        // get the list of followed profiles and channels
        const feed = await database.collection(squealCollection).find({
            $or: [{
                receiver: {
                    $in: profile.following_channels
                }
            },
            {
                receiver: {
                    $in: required_channels_names
                }
            },
            {
                author: {
                    $in: profile.following_list
                }
            }
            ],
            is_private: false
        }).sort({ date: -1 }) // ordered chronological order
            .skip(startIndex) // starting from startIndex
            .limit(endIndex - startIndex + 1) // returns endIndex squeals
            .toArray(); // returns the squeals as an array

        res.status(200).json(feed); // returns the squeals

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});


/* -------------------------------------------------------------------------- */
/*                                  /CHAT/                                    */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

//* GET
// returns a list of squeals based on author and receiver to construct a chat with a user and the logged user
// if not specified returns the first 10
// params: user1 (logged user), user2 (chat user) , startindex, endindex
app.get("/chat/", async (req, res) => {
    try {
        const logged_user = req.query.user1;
        const chat_user = req.query.user2;

        

        // initializing the start and end index in case they are not specified
        let startIndex = 0;
        let endIndex = 10;
        // check if the parameters are valid
        if (req.query.startindex !== undefined && !isNaN(req.query.startindex)) {
            startIndex = parseInt(req.query.startindex);
        }
        if (req.query.endindex !== undefined && !isNaN(req.query.endindex)) {
            endIndex = parseInt(req.query.endindex);
        }
        // check if the parameters are valid
        if (startIndex > endIndex) {
            res.status(400).json({
                message: "startIndex must be less than endIndex"
            });
            return;
        }

        // if the profile is not found, return 404
        if (chat_user == null || chat_user == "" || logged_user == null || logged_user == "") {
            res.status(404).json({
                message: "profile does not exist"
            });
            return;
        }

        await mongoClient.connect();
        // fetching the profile with the given name
        const chat_profile = await collection_profiles.findOne({
            name: chat_user
        });

        const logged_profile = await collection_profiles.findOne({
            name: logged_user
        });

        // if the profile is not found, return 404
        if (chat_profile.is_deleted == true) {
            res.status(404).json({
                message: "chat profile does not exist"
            });
            return;
        }

        // if the profile is not found, return 404
        if (!(await isAuthorizedOrHigher(logged_user, typeOfProfile.user)) || logged_profile == null || logged_profile.is_deleted === true) {
            res.status(404).json({
                message: "logged profile does not exist"
            });
            return;
        }

        // if the profile is private and the user is not authorized to view it, return 401
        if (!(await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin) || (await isSMMAuthorized(req.session.user, logged_user) && await isAuthorizedOrHigher(logged_user, typeOfProfile.user)) || logged_user == req.session.user)) {
            res.status(401).json({
                message: "you are not authorized to view this profile"
            });
            return;
        }


        //retrieve the squeals that belong to the chat
        const chat = await database.collection(squealCollection).find({
            $or: [{
                $and: [{ author: logged_user }, { receiver: chat_user }]
            },
            {
                $and: [{ author: chat_user }, { receiver: logged_user }]
            }
            ]
        }).sort({
            date: -1
        }) // ordered inverse chronological order
            .skip(startIndex) // starting from startIndex
            .limit(endIndex - startIndex + 1) // returns endIndex squeals
            .toArray(); // returns the squeals as an array

        res.status(200).json(chat); // returns the squeals
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});


/* -------------------------------------------------------------------------- */
/*                              /SQUEALS_LIST/                                */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

//* POST
// dato l'array di squeal id squealList ritorna un array di squeal
// NON ritorna squeal privati
// campo da dare nel body: squealList
// SUPPORTA QUERY DI PAGINAZIONE
// node sucks, can't use /squeals/list so here we are...
app.post("/squeals_list/", async (req, res) => {
    try {
        const squealList = req.body.squealList;

        console.log('Squeal List:', squealList)
        

        if (squealList == null || squealList.length === 0) {
            res.status(400).json({
                message: "squealList is required and has to be valid"
            });
            return;
        }

        // initializing the start and end index in case they are not specified
        let startIndex = 0;
        let endIndex = 10;
        // check if the parameters are valid
        if (req.query.startindex != null && !isNaN(req.query.startindex)) {
            startIndex = parseInt(req.query.startindex);
        }
        if (req.query.endindex != null && !isNaN(req.query.endindex)) {
            endIndex = parseInt(req.query.endindex);
        }
        // check if the parameters are valid
        if (startIndex > endIndex) {
            res.status(400).json({
                message: "startIndex must be less than endIndex"
            });
            return;
        }

        let squeals = [];
        let index = 0;

        console.log('Squeal List:', squealList)
        console.log('Start Index:', startIndex);
        console.log('End Index:', endIndex);

        await mongoClient.connect();
        for (const squeal of squealList) {
            // if we reached the end of index requested index, break
            if (index >= endIndex) {
                break;
            }

            const found_squeal = await collection_squeals.findOne({
                id: squeal,
                is_private: false
            });

            // squeal found
            if (found_squeal != null) {
                // if we didn't reach the start index, skip the found squeal
                if (index < startIndex) {
                    console.log("skipping squeal: " + found_squeal.id, "index: " + index)
                    index++;
                } else {
                    // if we reached the start index, add the squeal to the list
                    console.log("adding squeal: " + found_squeal.id, "index: " + index)
                    squeals.push(found_squeal);
                    index++;
                }
            }
        }

        if (squeals.length == 0) {
            res.status(404).json({
                message: "no squeals found"
            });
            return;
        }

        res.status(200).send(JSON.stringify(squeals));

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});



/* -------------------------------------------------------------------------- */
/*                                /SQUEALS/:ID                                */
/*                              GET, DELETE, POST                             */
/* -------------------------------------------------------------------------- */

// * GET
// ritorna lo squeal con id = id ricevuto come parametro
// non funziona per gli smm
app.get("/squeals/:id", async (req, res) => {
    try {
        const squealId = req.params.id;

        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.user);
        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);

        let squeal = null;

        await mongoClient.connect();

        // fetching the squeal with the given id
        squeal = await collection_squeals.findOne({
            id: squealId,
            is_private: false
        });

        // if the squeal is not found, check if a private one with that id exists and if the user can see it
        if (squeal == null) {
            if (adminAuthorized) {
                squeal = await collection_squeals.findOne({
                    id: squealId
                });
            } else if (authorized) {
                squeal = await collection_squeals.findOne({
                    id: squealId,
                    is_private: true,
                    $or: [
                        { author: req.session.user },
                        { receiver: req.session.user }
                    ]
                });
            }
        }

        // if the squeal is not found, return 404
        if (squeal == null) {
            res.status(404).json({
                message: "squeal not found"
            });
            return;
        }

        // if the squeal is private, check if the user is authorized to view it
        if (squeal.is_private == true && (squeal.author != req.session.user || squeal.receiver != req.session.user)) {
            res.status(401).json({
                message: "you are not authorized to view this squeal"
            });
            return;
        }

        // if the squeal is found, return it in json format
        res.status(200).json(squeal);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// * DELETE 
// elimina lo squeal con id = id ricevuto come parametro

app.delete("/squeals/:id", async (req, res) => {
    try {
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.user);
        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);


        // check if the user has logged in
        if (!authorized) {
            res.status(401).json({
                message: "you must be logged in to delete a squeal"
            });
            return;
        }

        const squealId = req.params.id; // squeal to delete

        // connect to the database
        await mongoClient.connect();
        const squeal = await collection_squeals.findOne({
            id: squealId
        }); // fetching the squeal to delete

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({
                message: "Error: ID not found in database."
            });
            return;
        }

        const SMMAuthorized = await isSMMAuthorized(req.session.user, squeal.author) && await isAuthorizedOrHigher(squeal.author, typeOfProfile.user);

        // if the user is not authorized to delete the squeal, return 401
        if (squeal.author !== req.session.user && !SMMAuthorized && !adminAuthorized) {
            res.status(401).json({
                message: "you are not authorized to delete this squeal"
            });
            return;
        }

        if (squeal.media != "" && squeal.media != null) {
            deletePic(squeal.media_id);
        }

        const channel = await collection_channels.findOne({
            name: squeal.receiver
        });

        // if the squeal does not have replies: remove it's id from the "replies_list" field of the father
        // if it has replies, modify it into a DeletedAccount squeal and update father and sons (reply_to and replies_list)
        if (squeal.replies_num === 0) { // the squeal doesn't have replies
            if (squeal.reply_to != null && squeal.reply_to != "") { // the squeal was replying to another one
                let fatherId = squeal.reply_to
                await collection_squeals.updateOne({
                    id: fatherId
                }, {
                    $pull: {
                        replies: squealId
                    },
                    $inc: {
                        replies_num: -1
                    }
                });
            }

            // if receiver is a channel, remove the squeal from the channel's squeals_list
            if (channel != null) {
                await collection_channels.updateOne({
                    name: squeal.receiver
                }, {
                    $pull: {
                        squeals_list: squealId
                    }
                });
            }

            // delete squeal from database
            await mongoClient.connect();
            try {
                const result = await collection_squeals.deleteOne({
                    id: squealId
                });
                if (result.deletedCount !== 1) {
                    res.status(500).json({
                        message: "No squeal found with the id: " + squealId + ", error: " + error.message
                    });
                    return;
                }
            } catch (error) {
                res.status(500).json({
                    message: "Error deleting the squeal: " + error.message
                });
                return;
            }
        } else { // the squeal has replies: move it to the deletedAccount and modify father/children accordingly

            // retrieve the "DeletedSqueals" account
            const deletedSquealsProfile = await collection_profiles.findOne({
                name: "DeletedSqueals"
            })
            const deletedSquealsNum = deletedSquealsProfile.squeals_num

            // reset fields of the squeal to be deleted
            await mongoClient.connect();
            await collection_squeals.updateOne({
                _id: squeal._id
            }, {
                $set: {
                    id: `DeletedSqueals${deletedSquealsNum}`,
                    author: 'DeletedSqueals',
                    media: '',
                    keywords: [],
                    mentions: [],
                    text: ''
                }
            });

            // if receiver is a channel, update the squeal from the channel's squeals_list
            if (channel !== null) {
                await collection_channels.updateOne({
                    name: squeal.receiver
                }, {
                    $pull: {
                        squeals_list: squealId
                    },
                    $put: {
                        squeals_list: `DeletedSqueals${deletedSquealsNum}`
                    }
                });
            }

            if (squeal.secondary_channels != null) {
                squeal.secondary_channels.forEach(async (channel) => {
                    await collection_channels.updateOne({
                        name: channel
                    }, {
                        $pull: {
                            squeals_list: squealId
                        }
                    });
                });
            }

            // if the squeal has a father, replace the squeal occurrence in the "replies_list"
            if (squeal.reply_to != null && squeal.reply_to !== "") {
                let fatherId = squeal.reply_to
                const squealFather = await collection_squeals.findOne({
                    id: fatherId
                })
                const index = squealFather.replies_list.indexOf(squealId); // indice nella replies_list a cui si trova squealId
                squealFather.replies_list[index] = `DeletedSqueals${deletedSquealsNum}`

                await mongoClient.connect();
                await collection_squeals.updateOne({
                    id: fatherId
                }, {
                    $set: {
                        replies_list: squealFather.replies_list
                    }
                });
            }

            // update the reply_to field of the squeals that were replying to the deleted one
            let squealRepliesList = squeal.replies_list
            await mongoClient.connect();
            squealRepliesList.forEach(async (reply) => {
                try {
                    let tmp_reply = await collection_squeals.findOne({
                        id: reply
                    }) // retrieve a squeal that was a reply to the deleted squeal
                    await collection_squeals.updateOne({
                        _id: tmp_reply._id
                    }, {
                        $set: {
                            reply_to: `DeletedSqueals${deletedSquealsNum}`
                        }
                    });
                } catch {
                    res.status(500).json({
                        message: error.message
                    });
                }
            });

            // update the counter of the deleted squeals profile
            await mongoClient.connect();
            await collection_profiles.updateOne({
                _id: deletedSquealsProfile._id
            }, {
                $inc: {
                    squeals_num: 1
                }
            });
        }
        res.status(200).json({
            message: "Squeal deleted successfully."
        })
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});


//* POST
// solo per admin -> modifica quello che vuole (tranne id e autore)
// the admin has the power to break all logics, use carefully
app.post("/squeals/:id", async (req, res) => {
    try {
        let adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);

        console.log("body: " + JSON.stringify(req.body))

        if (adminAuthorized) {
            const squealId = req.params.id;

            // possible body params
            const possibleParams = [
                "text",
                "positive_reactions",
                "negative_reactions",
                "positive_reactions_list",
                "negative_reactions_list",
                "media",
                "impressions",
                "keywords",
                "location",
                "mentions",
            ];

            const possibleIntParams = [
                "positive_reactions",
                "negative_reactions",
                "impressions",
                "date"
            ];

            let update = {};

            for (const field of possibleParams) {
                if (req.body[field] != null) {
                    update[field] = req.body[field];
                }
            }

            for (const field of possibleIntParams) {
                if (req.body[field] != null) {
                    update[field] = parseInt(req.body[field]);
                }
            }

            if (req.body.is_private != null) {
                update["is_private"] = req.body.is_private;
            }

            // calculating the polarity ratio
            if (update.positive_reactions != null && update.negative_reactions != null && update.impressions != null && update.impressions !== 0 && update.positive_reactions !== NaN && update.negative_reactions !== NaN && update.impressions !== NaN) {
                update.pos_popolarity_ratio = update.positive_reactions / update.impressions;
                update.neg_popolarity_ratio = update.negative_reactions / update.impressions;
            }


            await mongoClient.connect();
            // fetching the squeal with the given id
            const squeal = await collection_squeals.findOne({
                id: squealId
            });

            // if the squeal is not found, return 404
            if (squeal === null) {
                res.status(404).json({
                    message: "squeal not found"
                });
                return;
            }

            await mongoClient.connect();
            // if the squeal is found, update it
            const result = await collection_squeals.updateOne({
                id: squealId
            }, {
                $set: update
            });

            console.log('Squeal successfully updated: ', result.modifiedCount + '\n' + JSON.stringify(update));

            res.status(201).json({
                message: "squeal updated successfully"
            });
        } else {
            res.status(401).send();
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});

/* -------------------------------------------------------------------------- */
/*                             /SQUEALS/:ID/MEDIA                             */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// returns the image of the squeal with id = id in the media field
// from the id to the image
app.get("/squeals/:id/media", async (req, res) => {
    try {
        const squealId = req.params.id;

        // fetching the squeal with the given id
        const squeal = await collection_squeals.findOne({
            id: squealId,
            is_private: false
        });

        // if the squeal is not found, return 404
        if (squeal == null) {
            res.status(404).json({
                message: "squeal not found"
            });
            return;
        }

        if (squeal.media == "" || squeal.media == null) {
            res.status(404).json({
                message: "squeal does not have a media"
            });
            return;
        }

        await exportPic(squeal.media_id, res);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});


/* -------------------------------------------------------------------------- */
/*                         /SQUEALS/:ID/REPLIESNUMBER                         */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna il numero di replies dello squeal con id = id ricevuto come parametro
app.get("/squeals/:id/repliesnumber", async (req, res) => {
    try {
        const squealId = req.params.id;

        // fetching the squeal with the given id
        const squeal = await collection_squeals.findOne({
            id: squealId
        });

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({
                message: "squeal not found"
            });
            return;
        }

        console.log('Number of Replies:', JSON.stringify(squeal.replies_num));

        // if the squeal is found, return its replies
        res.status(200).json(squeal.replies_num);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});


/* -------------------------------------------------------------------------- */
/*                            /SQUEALS/:ID/REPLIES/                           */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna la lista delle replies dello squeal con id = id ricevuto come parametro
// query facoltativa che ritorna le replies da startIndex a endIndex, se non specificati ritorna le prime 10
app.get("/squeals/:id/replies/", async (req, res) => {
    try {
        const squealId = req.params.id;

        // initializing the start and end index in case they are not specified
        let startIndex = 0;
        let endIndex = 10;
        // check if the parameters are valid
        if (req.query.startindex != null && !isNaN(req.query.startindex)) {
            startIndex = parseInt(req.query.startindex);
        }
        if (req.query.endindex != null && !isNaN(req.query.endindex)) {
            endIndex = parseInt(req.query.endindex);
        }
        // check if the parameters are valid
        if (startIndex > endIndex) {
            res.status(400).json({
                message: "startIndex must be less than endIndex"
            });
            return;
        }

        // fetching the squeal with the given id
        const main_squeal = await collection_squeals.findOne({
            id: squealId
        });

        // if the squeal is not found, return 404
        if (main_squeal === null) {
            res.status(404).json({
                message: "squeal not found"
            });
            return;
        }

        // only getting the IDs of the wanted replies
        let idsOfSquealRepliesToReturn = main_squeal.replies.slice(startIndex, endIndex);

        // what we'll return
        let squealReplies = [];

        let child_squeal;

        // fetching the replies
        for (const child_squeal_id of idsOfSquealRepliesToReturn) {
            child_squeal = await collection_squeals.findOne({
                id: child_squeal_id,
                is_private: false
            });

            // if the squeal is not found, skip it, but log it so we know something's wrong
            if (child_squeal == null) {
                console.log("Child squeal with id " + child_squeal_id + " not accessible");
            } // if the squeal is found, add it to the list of replies
            else {
                squealReplies.push(child_squeal);
            }
        }

        console.log('Replies:', JSON.stringify(squealReplies));
        // if the squeal is found, return its replies
        res.status(200).json(squealReplies);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});


/* -------------------------------------------------------------------------- */
/*                         /SQUEALS/:ID/:REACTION_LIST                        */
/*                                 GET & POST                                 */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna la lista di utenti che hanno reagito allo squeal con id = id ricevuto come parametro
// oppure ritorna il numero di impressioni di uno squeal
app.get("/squeals/:id/:reaction_list", async (req, res) => {
    try {
        const squealId = req.params.id;
        const reactions = req.params.reaction_list;

        if (reactions == "impressions") {
            // fetching the squeal with the given id
            await mongoClient.connect();
            const squeal = await collection_squeals.findOne({
                id: squealId
            });

            // if the squeal is not found, return 404
            if (squeal === null) {
                res.status(404).json({
                    message: "squeal not found"
                });
                return;
            }
            // if the squeal is found, return its impressions
            res.status(200).json(squeal.impressions);
            return;
        }

        if (reactions == "positive_reactions") {
            // fetching the squeal with the given id
            await mongoClient.connect();
            const squeal = await collection_squeals.findOne({
                id: squealId
            });

            // if the squeal is not found, return 404
            if (squeal === null) {
                res.status(404).json({
                    message: "squeal not found"
                });
                return;
            }
            // if the squeal is found, return its positive reactions number
            res.status(200).json({positive_reactions: squeal.positive_reactions});
            return;
        }

        if (reactions == "negative_reactions") {
            // fetching the squeal with the given id
            await mongoClient.connect();
            const squeal = await collection_squeals.findOne({
                id: squealId
            });

            // if the squeal is not found, return 404
            if (squeal === null) {
                res.status(404).json({
                    message: "squeal not found"
                });
                return;
            }
            // if the squeal is found, return its positive reactions number
            res.status(200).json({negative_reactions: squeal.negative_reactions});
            return;
        }

        // check if the reaction list is valid
        if (reactions != "positive_reactions_list" && reactions != "negative_reactions_list") {
            res.status(400).json({
                message: "invalid reaction list"
            });
            return;
        }

        const reaction_list = req.params.reaction_list;

        // fetching the squeal with the given id
        const squeal = await collection_squeals.findOne({
            id: squealId
        });

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({
                message: "squeal not found"
            });
            return;
        }

        // if the squeal is found, return its reaction list
        res.status(200).json(squeal[reaction_list]);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});

//* POST
// aggiunge un utente alla lista di reazioni positive/negative dello squeal con id = id ricevuto come parametro
// se l'utente è già presente nella lista, lo rimuove
// se l'utente apppartiene alla lista opposta, lo rimuove da quella e lo aggiunge a questa
// aggiunge un' impressione allo squeal con id = id ricevuto come parametro se la lista ricevuta è "impressions"
app.post("/squeals/:id/:reaction_list", bodyParser.json(), async (req, res) => {
    try {
        const squealId = req.params.id;
        const reactions = req.params.reaction_list;

        if (reactions == "impressions") {
            // fetching the squeal with the given id
            await mongoClient.connect();
            const squeal = await collection_squeals.findOne({
                id: squealId
            });

            // if the squeal is not found, return 404
            if (squeal === null) {
                res.status(404).json({
                    message: "squeal not found"
                });
                return;
            }
            // if the squeal is found, update its impressions
            squeal.impressions += 1;

            squeal.pos_popolarity_ratio = squeal.positive_reactions / squeal.impressions;
            squeal.neg_popolarity_ratio = squeal.negative_reactions / squeal.impressions;

            // update the squeal's impressions
            const result = await collection_squeals.updateOne({
                id: squealId
            }, {
                $set: {
                    impressions: squeal.impressions,
                    pos_popolarity_ratio: squeal.pos_popolarity_ratio,
                    neg_popolarity_ratio: squeal.neg_popolarity_ratio
                }
            });

            if (result.modifiedCount === 1) {
                res.status(200).json({
                    message: "impression updated successfully"
                });
            } else {
                res.status(500).json({
                    message: "failed to update impression"
                });
            }
            return;
        }

        // check if the reaction list is valid
        if (reactions != "positive_reactions_list" && reactions != "negative_reactions_list") {
            res.status(400).json({
                message: "invalid reaction list"
            });
            return;
        }

        let reaction_num;
        let reaction_ratio;

        let opposite_reaction_list;
        let opposite_reaction_num;
        let opposite_reaction_ratio;

        // assign the correct variables for updating the correct lists
        if (reactions == "positive_reactions_list") {
            reaction_num = "positive_reactions";
            reaction_ratio = "pos_popolarity_ratio";
            opposite_reaction_list = "negative_reactions_list";
            opposite_reaction_num = "negative_reactions";
            opposite_reaction_ratio = "neg_popolarity_ratio";
        }
        if (reactions == "negative_reactions_list") {
            reaction_num = "negative_reactions";
            reaction_ratio = "neg_popolarity_ratio";
            opposite_reaction_list = "positive_reactions_list";
            opposite_reaction_num = "positive_reactions";
            opposite_reaction_ratio = "pos_popolarity_ratio";

        }

        if (req.body.user == null) {
            req.body.user = req.session.user;
        }

        const authorized = await isAuthorizedOrHigher(req.body.user, typeOfProfile.user) && req.session.user == req.body.user;
        const SMMAuthorized = await isSMMAuthorized(req.session.user, req.body.user) && await isAuthorizedOrHigher(req.body.user, typeOfProfile.user);

        // check if the user is logged in
        if (!authorized && !SMMAuthorized) {
            res.status(401).json({
                message: "you must be logged in to react to a squeal"
            });
            return;
        }

        await mongoClient.connect();
        // fetching the squeal with the given id
        const squeal = await collection_squeals.findOne({
            id: squealId
        });

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({
                message: "squeal not found"
            });
            return;
        }

        // if the squeal is found, update its reaction list
        // if the user is already in the list, remove it
        if (squeal[reactions].includes(req.body.user)) {
            squeal[reactions].splice(squeal[reactions].indexOf(req.body.user), 1);
            squeal[reaction_num] -= 1;
            squeal[reaction_ratio] = squeal[reaction_num] / squeal.impressions;
            console.log("User removed from the list");
        } else { // if the user is not in the list, add it
            squeal[reactions].push(req.body.user);
            squeal[reaction_num] += 1;
            squeal[reaction_ratio] = squeal[reaction_num] / squeal.impressions;

            // if the user is in the opposite list, remove it
            if (squeal[opposite_reaction_list].includes(req.body.user)) {
                squeal[opposite_reaction_list].splice(squeal[opposite_reaction_list].indexOf(req.body.user), 1);
                squeal[opposite_reaction_num] -= 1;
                squeal[opposite_reaction_ratio] = squeal[opposite_reaction_num] / squeal.impressions;
            }

            console.log("User added to the list, opposite reaction removed");

        }

        await mongoClient.connect();
        const result = await collection_squeals.updateOne({
            id: squealId
        }, {
            $set: squeal
        });

        res.status(200).json({
            message: "reaction updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});