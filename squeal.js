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
    mongoClient,
    CM
} = require("./const.js");

// connecting to the database
mongoClient.connect();
const database = mongoClient.db(dbName);
const collection_squeals = database.collection(squealCollection);
const collection_profiles = database.collection(profileCollection);

/* -------------------------------------------------------------------------- */
/*                                 /SQUEALS/                                  */
/*                                 GET & PUT                                  */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna una lista di squeal del database, da startindex ad endindex

// Author, popularity , end_date, start_date, positive_reactions, negative_reactions, impressions
// receiver (group), Keyword, Mentions, is_private
app.get("/squeals/", async (req, res) => {
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
        // check if the parameters are valid
        if (startIndex > endIndex) {
            res.status(400).json({
                message: "startIndex must be less than endIndex"
            });
            return;
        }

        // initializing the start and end date in case they are not specified
        let start_date = 0;
        let end_date = Date.now();
        // check if the parameters are valid
        if (req.query.start_date !== undefined && req.query.start_date !== NaN) {
            start_date = parseInt(req.query.start_date);
        }
        if (req.query.end_date !== undefined && req.query.start_date !== NaN) {
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
        if (await !isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
            if (req.query.is_private === "true" || req.query.is_private === true) {
                res.status(401).json({
                    message: "only admins can access private messages"
                });
                return;
            }
        } else {
            // if the user is authorized, add the is_private field to the search object if requested
            if (req.query.is_private === "true" || req.query.is_private === true) {
                search["is_private"] = true;
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
                timestamp: -1
            }) // ordered inverse chronological order
            .skip(startIndex) // starting from startIndex
            .limit(endIndex) // returns endIndex squeals
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
app.put("/squeals/", bodyParser.json(), async (req, res) => {
    try {
        // console.log('Request Body:', req.body);

        const requiredFields = [
            "author",
            "text",
            "receiver"
        ];

        // Check if all required fields are present in the request body
        for (const field of requiredFields) {
            if (req.body[field] === undefined && req.body[field] != "") {
                res.status(400).json({
                    message: `${field} is required`
                });
                return;
            }
        }
        // If all required fields are present, continue with the insertion

        if ((await isAuthorizedOrHigher(req.session.user, typeOfProfile.user) && req.session.user === req.body.author) || (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin))) {
            // defining the required fields as well as initializing the standard fields
            let newSqueal = {
                id: "",
                author: req.body.author,
                text: req.body.text,
                receiver: req.body.receiver,
                date: Date.now(),
                positive_reactions: 0,
                positive_reactions_list: [],
                negative_reactions: 0,
                negative_reactions_list: [],
                replies_num: 0,
                impressions: 0,
                is_private: false
            }

            // checking boolean separately because in optionalFields it would be seen as string
            if (req.body.is_private === "true" || req.body.is_private === true) {
                newSqueal.is_private = true;
            }

            const optionalFields = [
                "media",
                "reply_to",
                "replies",
                "keywords",
                "mentions"
            ];

            // Check if the optional fields are present in the request body
            // If they are, add them to the newSqueal object
            for (const field in optionalFields) {
                if (req.body[field] !== undefined && req.body[field] != "") {
                    newSqueal[field] = req.body[field];
                }
            }

            await mongoClient.connect();

            const profile_author = await collection_profiles.findOne({
                name: newSqueal.author
            });

            // CREDITS
            // 0 = giorno, 1 = settimana, 2 = mese
            // if the author does not exist, invalid request
            if (profile_author === null) {
                res.status(400).json({
                    message: "author does not exist"
                });
                return;

            } // check if the authos has enough credit 
            else if ((profile_author.credit[0] < newSqueal.text.length || profile_author.credit[1] < newSqueal.text.length || profile_author.credit[2] < newSqueal.text.length) && await !isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
                res.status(400).json({
                    message: "author does not have enough credit\navailable\ng: " + profile_author.credit[0] + " s: " + profile_author.credit[1] + " m: " + profile_author.credit[2] + ")\nrequired\n " + newSqueal.text.length
                });
                return;
            }
            // if the author exists, update the number of squeals, the list of squeals and it's credit
            const squeals_num = parseInt(profile_author.squeals_num) + 1;
            const squeals_list = profile_author.squeals_list;

            let g, s, m;

            // if the author is an admin, don't subtract the credit
            if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
                console.log("admin");
                g = profile_author.credit[0];
                s = profile_author.credit[1];
                m = profile_author.credit[2];
            } else {
                console.log("not admin");
                g = profile_author.credit[0] - newSqueal.text.length;
                s = profile_author.credit[1] - newSqueal.text.length;
                m = profile_author.credit[2] - newSqueal.text.length;
            }

            console.log("g: " + g + " s: " + s + " m: " + m);

            // update the author's squeals_num and squeals_list
            newSqueal.id = `${profile_author.name}${squeals_num}`;

            // adds the new squeal to the list of squeals
            squeals_list.push(newSqueal.id);


            await mongoClient.connect();

            // update the author's squeals_num and squeals_list
            await collection_profiles.updateOne({
                name: profile_author.name
            }, {
                $set: {
                    squeals_num: squeals_num,
                    list_squeal_id: squeals_list,
                    credit: {
                        0: g,
                        1: s,
                        2: m
                    }
                }
            })

            if (newSqueal.reply_to !== undefined) {
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

            // Insert the new squeal in the database without converting it to a JSON string
            const result = await collection_squeals.insertOne(newSqueal);

            console.log('Documento inserito con successo: ', result.insertedId + '\n' + JSON.stringify(newSqueal));
            res.status(200).send(JSON.stringify({
                message: "squeal added successfully with db id:" + result.insertedId
            }));
        } else {
            res.status(401).send();
        }
    } catch (error) {
        console.error('Errore durante l inserimento del documento: ', error);
        res.status(500).send(JSON.stringify({
            message: error.message
        }));
    }
})


/* -------------------------------------------------------------------------- */
/*                                /SQUEALS/:ID                                */
/*                            GET, PUT, DELETE, POST                          */
/* -------------------------------------------------------------------------- */

// * GET
// ritorna lo squeal con id = id ricevuto come parametro
app.get("/squeals/:id", async (req, res) => {
    try {
        const squealId = req.params.id;

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

        // if the squeal is found, return it in json format
        res.status(200).json(squeal);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// * PUT
// aggiunge/sovrascrive lo squeal con id = id ricevuto come parametro
app.put("/squeals/:id", bodyParser.json(), async (req, res) => {
    try {
        const squealId = req.params.id;

        // fetching the squeal with the given id
        const squeal = await collection_squeals.findOne({
            id: squealId
        });

        const requiredFields = [
            "author",
            "text",
            "receiver"
        ];

        // Check if all required fields are present in the request body
        for (const field of requiredFields) {
            if (req.body[field] === undefined && req.body[field] != "") {
                res.status(400).json({
                    message: `${field} is required`
                });
                return;
            }
        }
        // If all required fields are present, continue with the insertion

        if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
            // defining the required fields as well as initializing the standard fields
            let newSqueal = {
                id: squealId,
                author: req.body.author,
                text: req.body.text,
                receiver: req.body.receiver,
                date: Date.now(),
                positive_reactions: 0,
                positive_reactions_list: [],
                negative_reactions: 0,
                negative_reactions_list: [],
                replies: [],
                replies_num: 0,
                impressions: 0
            }

            const optionalFields = [
                "media",
                "reply_to",
                "keywords",
                "mentions"
            ];

            // Check if the optional fields are present in the request body
            // If they are, add them to the newSqueal object
            for (const field in optionalFields) {
                if (req.body[field] !== undefined && req.body[field] != "") {
                    newSqueal[field] = req.body[field];
                }
            }

            // if the squeal is found, update and return the update
            if (squeal != null) {
                const result = await collection_squeals.updateOne({
                    id: squealId
                }, {
                    $set: newSqueal
                });
                res.status(200).json({
                    message: "squeal updated successfully"
                });
                return;
            } else {
                // if the squeal is not found, add it to the database
                const result = await collection_squeals.insertOne(newSqueal);
                res.status(200).json({
                    message: "squeal added successfully"
                });
                return;
            }
        } else {
            res.status(401).send();
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});

// * DELETE 
// elimina lo squeal con id = id ricevuto come parametro

//TODO elimina/sostituisci lo squealID se presente in un channel (chiama la delete di channel/:name/squealList, prendi i nomi da una ricerca)
app.delete("/squeals/:id", async (req, res) => {
    try {
        // check if the user has logged in
        //*if ((await isAuthorizedOrHigher(req.session.user, typeOfProfile.user) && req.session.user === squeal.author) || (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin))) {
        if(true){
            const squealId = req.params.id; // squeal to delete

            // connect to the database
            await mongoClient.connect();
            const squeal = await collection_squeals.findOne({ id: squealId }); // fetching the squeal to delete

            // if the squeal is not found, return 404
            if (squeal === null) {
                res.status(404).json({ message: "Error: ID not found in database." });
                return;
            }

            // if the squeal does not have replies: remove it's id from the "replies_list" field of the father
            // if it has replies, modify it into a DeletedAccount squeal and update father and sons (reply_to and replies_list)
            if (squeal.replies_num === 0) {                                      // the squeal doesn't have replies
                if (squeal.reply_to !== undefined && squeal.reply_to != "") {    // the squeal was replying to another one
                    let fatherId = squeal.reply_to
                    await collection_squeals.updateOne(
                        { id: fatherId },
                        { $pull: { replies_list: squealId }, $inc: { replies_num: -1 } },
                        (err, res) => {
                            if (err) {
                                console.error('Error during the update of the father: ', err);
                            } else {
                                console.log('Father successfuly updated.');
                            }
                        }
                    );
                }
                // delete squeal from database
                await mongoClient.connect();
                try {
                    const result = await collection_squeals.deleteOne({ id: squealId });
                    if (result.deletedCount === 1) {
                        console.log('Squeal successfully erased.');
                    } else {
                        console.log('No squeal found with the id:', squealId);
                    }
                } catch (error) {
                    console.error('Error deleting the squeal:', error);
                }
            }
            else {  // the squeal has replies: move it to the deletedAccount and modify father/children accordingly
                
                // retrieve the "DeletedSqueals" account
                const deletedSquealsProfile = await collection_profiles.findOne({ name: "DeletedSqueals" })
                const deletedSquealsNum = deletedSquealsProfile.squeals_num

                // reset fields of the squeal to be deleted
                await mongoClient.connect();
                await collection_squeals.updateOne( 
                    { _id: squeal._id },
                    {
                        $set: {
                            id: `DeletedSqueals${deletedSquealsNum}`,
                            author: 'DeletedSqueals',
                            media: '',
                            keywords: [],
                            mentions: [],
                            text: ''
                        }
                    }
                );
            
                // if the squeal has a father, replace the squeal occurrence in the "replies_list"
                if (squeal.reply_to !== undefined && squeal.reply_to !== "") {
                    let fatherId = squeal.reply_to
                    const squealFather = await collection_squeals.findOne({ id: fatherId })
                    const index = squealFather.replies_list.indexOf(squealId); // indice nella replies_list a cui si trova squealId
                    squealFather.replies_list[index] = `DeletedSqueals${deletedSquealsNum}`

                    await mongoClient.connect();
                    await collection_squeals.updateOne({ id: fatherId }, { $set: { replies_list: squealFather.replies_list } });
                }

                // update the reply_to field of the squeals that were replying to the deleted one
                let squealRepliesList = squeal.replies_list
                await mongoClient.connect();
                squealRepliesList.forEach(async (reply) => {            
                    try {
                        let tmp_reply = await collection_squeals.findOne({ id: reply })  // retrieve a squeal that was a reply to the deleted squeal
                        await collection_squeals.updateOne(
                            { _id: tmp_reply._id },
                            { $set: { reply_to: `DeletedSqueals${deletedSquealsNum}` } }
                        );
                    }
                    catch {
                        res.status(500).json({ message: error.message });
                    }
                });
                
                // update the counter of the deleted squeals profile
                await mongoClient.connect();
                await collection_profiles.updateOne(
                    { _id: deletedSquealsProfile._id },
                    { $inc: { squeals_num: 1 } }
                );
            }
        }
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
    }
});


//* POST
// solo per admin -> modifica quello che vuole (tranne id e autore)
// the admin has the power to break all logics, use carefully
app.post("/squeals/:id", bodyParser.json(), async (req, res) => {
    try {
        if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
            const squealId = req.params.id;

            // possible body params
            const possibleParams = [
                "receiver",
                "text",
                "positive_reactions",
                "negative_reactions",
                "positive_reactions_list",
                "negative_reactions_list",
                "media",
                "reply_to",
                "impressions",
                "keywords",
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
                if (req.body[field] !== undefined) {
                    update[field] = req.body[field];
                }
            }

            for (const field of possibleIntParams) {
                if (req.body[field] !== undefined) {
                    update[field] = parseInt(req.body[field]);
                }
            }

            if (req.body.is_private !== undefined) {
                update["is_private"] = req.body.is_private;
            }

            // calculating the polarity ratio
            if (update.positive_reactions !== undefined && update.negative_reactions !== undefined && update.impressions !== undefined && update.impressions !== 0 && update.positive_reactions !== NaN && update.negative_reactions !== NaN && update.impressions !== NaN) {
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
            res.status(200).json({
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
// ritorna il campo media dello squeal con id = id ricevuto come parametro
app.get("/squeals/:id/media", async (req, res) => {
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

        // if the squeal is found, return its media
        res.status(200).json(squeal.media);
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
        if (req.query.startIndex !== undefined && req.query.startIndex !== NaN) {
            startIndex = parseInt(req.query.startindex);
        }
        if (req.query.endindex !== undefined && req.query.endindex !== NaN) {
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
                id: child_squeal_id
            });

            // if the squeal is not found, skip it, but log it so we know something's wrong
            if (child_squeal === null) {
                console.log("Child squeal with id " + child_squeal_id + " not found");
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
// aggiunge un' impressione allo squeal con id = id ricevuto come parametro se la lista ricevuta è "impressions"

// ! the Function is tested, but the session.user is not, if this gives problems is because of the session.user param
app.post("/squeals/:id/:reaction_list", bodyParser.json(), async (req, res) => {
    try {
        const squealId = req.params.id;
        const reactions = req.params.reaction_list;

        if(reactions == "impressions"){
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
                res.status(200).json({ message: "impression updated successfully" });
            } else {
                res.status(500).json({ message: "failed to update impression" });
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

        // assign the correct variables for updating the correct lists
        if (reactions == "positive_reactions_list") {
            reaction_num = "positive_reactions";
            reaction_ratio = "pos_popolarity_ratio";
        }
        if (reactions == "negative_reactions_list") {
            reaction_num = "negative_reactions";
            reaction_ratio = "neg_popolarity_ratio";
        }

        // check if the user is logged in
        if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.user)) {
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
        if (squeal[reactions].includes(req.session.user)) {
            squeal[reactions].splice(squeal[reactions].indexOf(req.session.user), 1);
            squeal[reaction_num] -= 1;
            squeal[reaction_ratio] = squeal[reaction_num] / squeal.impressions;
            console.log("User removed from the list");
        } else { // if the user is not in the list, add it
            squeal[reactions].push(req.session.user);
            squeal[reaction_num] += 1;
            squeal[reaction_ratio] = squeal[reaction_num] / squeal.impressions;
            console.log("User added to the list");

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