global.rootDir = __dirname;

const {
    parse
} = require("path");
const {
    app
} = require("./index.js");
const {
    typeOfProfile,
    isAuthorized
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
const collection = database.collection(squealCollection);
const collection_for_profiles = database.collection(profileCollection);
/*
https://site222326.tw.cs.unibo.it/squeals/?popularity=isPopular

*/

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
        if (await !isAuthorized(req.session.user, typeOfProfile.admin)) {
            if (req.query.is_private === "true" || req.query.is_private === true) {
                res.status(403).json({
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
            if (req.query[field] !== undefined) {
                let tmp = req.query[field];
                search[field] = tmp;
            }
        }

        console.log('Search:', JSON.stringify(search));


        // await mongoClient.connect();
        const squeals = await collection.find(search)
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
            if (req.body[field] === undefined) {
                res.status(400).json({
                    message: `${field} is required`
                });
                return;
            }
        }
        // If all required fields are present, continue with the insertion

        if ( /*(await isAuthorized(req.session.user, typeOfProfile.user) && req.session.user === requiredFields.author) || (await isAuthorized(req.session.user, typeOfProfile.admin))*/ true) {
            // defining the required fields as well as initializing the standard fields
            let newSqueal = {
                id: "",
                author: req.body.author,
                text: req.body.text,
                receiver: req.body.receiver,
                date: Date.now(),
                positive_reactions: 0,
                positive_reactions_users: [],
                negative_reactions: 0,
                negative_reactions_users: [],
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
                if (req.body[field] !== undefined) {
                    newSqueal[field] = req.body[field];
                }
            }

            await mongoClient.connect();

            const profile_author = await collection_for_profiles.findOne({name: newSqueal.author});

            // CREDITS
            // 0 = giorno, 1 = settimana, 2 = mese
            // if the author does not exist, invalid request
            if (profile_author === null) {
                res.status(400).json({
                    message: "author does not exist"
                });
                return;

            } // check if the authos has enough credit 
            else if ((profile_author.credit[0] < newSqueal.text.length || profile_author.credit[1] < newSqueal.text.length || profile_author.credit[2] < newSqueal.text.length) && await !isAuthorized(req.session.user, typeOfProfile.admin)) {
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
            if (await isAuthorized(req.session.user, typeOfProfile.admin)) {
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
            await collection_for_profiles.updateOne({
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
                const squeal_replied_to = await collection.findOne({
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
                await collection.updateOne({
                    id: squeal_replied_to.id
                }, {
                    $set: {
                        replies_num: replies_num,
                        replies: replies_list
                    }
                });
            }

            // Insert the new squeal in the database without converting it to a JSON string
            const result = await collection.insertOne(newSqueal);

            console.log('Documento inserito con successo: ', result.insertedId + '\n' + JSON.stringify(newSqueal));
            res.status(200).send(JSON.stringify({
                message: "squeal added successfully with db id:" + result.insertedId
            }));
        } else {
            // https://auth0.com/blog/forbidden-unauthorized-http-status-codes/#Web-APIs-and-HTTP-Status-Codes
            res.status(403).send();
        }
    } catch (error) {
        console.error('Errore durante l inserimento del documento: ', error);
        res.status(500).send(JSON.stringify({
            message: error.message
        }));
    }
})

/*
    try {
        await mongo.connect();
        const database = mongo.db(dbName);
        const collection = database.collection(squealCollection);
        const squeals = await collection.find().toArray();
        res.status(200).json(squeals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongo.close();
    }
*/


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
        const squeal = await collection.findOne({
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
        const squeal = await collection.findOne({
            id: squealId
        });

        const requiredFields = [
            "author",
            "text",
            "receiver"
        ];

        // Check if all required fields are present in the request body
        for (const field of requiredFields) {
            if (req.body[field] === undefined) {
                res.status(400).json({
                    message: `${field} is required`
                });
                return;
            }
        }
        // If all required fields are present, continue with the insertion

        if (await isAuthorized(req.session.user, typeOfProfile.admin)) {
            // defining the required fields as well as initializing the standard fields
            let newSqueal = {
                id: squealId,
                author: req.body.author,
                text: req.body.text,
                receiver: req.body.receiver,
                date: Date.now(),
                positive_reactions: 0,
                positive_reactions_users: [],
                negative_reactions: 0,
                negative_reactions_users: [],
                replies_num: 0,
                impressions: 0
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
                if (req.body[field] !== undefined) {
                    newSqueal[field] = req.body[field];
                }
            }

            // if the squeal is found, update and return the update
            if (squeal != null) {
                const result = await collection.updateOne({
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
                const result = await collection.insertOne(newSqueal);
                res.status(200).json({
                    message: "squeal added successfully"
                });
                return;
            }
        } else {
            res.status(403).send();
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});

// * DELETE UNFINISHED
// elimina lo squeal con id = id ricevuto come parametro

// TODO cancella dal db se non ci sono reply
// TODO cancella tutti i contenuti, rimpiazza id con deletedXXXXXX e cambia il campo reply_to dei figli in replies
// TODO controllare se l'utente è loggato e se è l'autore dello squeal oppure un admin
// TODO cancella l'id dalla lista nel profilo dell'autore che contiene gli id degli squeal

/*
individuare lo squeal nel database tramite id
cancellarne i campi: media, keywords, mentions, text
cambiare il campo author in "deleted"
accedere al profilo "deleted" e salvarsi la variabile XXX = "num_deleted_squeals"
cambiare il campo id dello squeal cancellato in "deletedXXX"
XXX + 1
scorrere tutti i figli e cambiarne il campo reply_to con il valore "deletedXXX"

! cosa fare con gli squeal mandati in privato?
TODO creare il profilo DeletedSqueals con il campo speciale "num_deleted_squeals"

TODO se si cancella uno squeal figlio, bisogna andare nel padre e nelle replies cambiare l'id

TODO se non ci sono dipendenze nel reply_to e replies si cancella interamente dal database propone Luiso
*/

app.delete("/squeals/:id", async (req, res) => {
    try {
        const squealId = req.params.id; // squeal to delete

        // fetching the squeal with the given id
        const squeal = await collection.findOne({
            id: squealId
        });

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({
                message: "Error: ID not found in database."
            });
            return;
        }

        // if the squeal is found, reset the fields and move it to the "DeletedSqueals" account
        if ((await isAuthorized(req.session.user, typeOfProfile.user) && req.session.user === squeal.author) || (await isAuthorized(req.session.user, typeOfProfile.admin))) {


            // retrieve the "DeletedSqueals" account
            const deletedSquealsProfile = await Profiles.findOne({
                name: "DeletedSqueals"
            })
            const numDeletedSqueals = deletedSquealsProfile.num_deleted_squeals

            // reset fields of the squeal that is going to be deleted
            await collection.updateOne( //? forse non necessario collection.updateOne in quanto possiedo già lo squeal di cui devo fare update
                {
                    _id: squeal._id
                }, {
                    $set: {
                        id: `DeletedSqueals${numDeletedSqueals}`, //? io SPERO che funzioni così
                        author: 'DeletedSqueals',
                        media: '',
                        keywords: [],
                        mentions: [],
                        text: ''
                    }
                }
            );

            // modify all the squeals that were replying to the deleted one
            let squealRepliesList = squeal.replies
            let tmp_squeal = await Profiles.findOne({
                name: "DeletedSqueals"
            })

            squealRepliesList.forEach(async (reply) => {
                try {
                    let tmp = await collection.findOne({
                        id: reply
                    })
                    const index = tmp.reply_to.indexOf(squealId);

                    if (index !== -1) {
                        tmp.reply_to[index] = `DeletedSqueals${numDeletedSqueals}`;

                        await collection.updateOne({
                            _id: tmp._id
                        }, {
                            $set: {
                                reply_to: tmp.reply_to
                            }
                        });

                        console.log('Sostituzione effettuata con successo.');
                    } else {
                        console.log('"XXX" non trovato nella lista.');
                    }
                } catch {
                    res.status(500).json({
                        message: error.message
                    });
                }
            });

            // update the progressive number on DeletedProfiles
            numDeletedSqueals += 1
            await Profiles.updateOne({
                name: "DeletedSqueals"
            }, {
                $set: {
                    num_deleted_squeals: numDeletedSqueals
                }
            })

            res.status(200).json({
                message: "squeal deleted successfully"
            });
        } else {
            res.status(403).send();
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});

/*app.delete("/squeals/:id", async (req, res) => {
    try {
        const squealId = req.params.id;

        // fetching the squeal with the given id
        const squeal = await collection.findOne({ id: squealId });

        // if the squeal is not found, return 404
        if (squeal === null) {
            const result = await collection.insertOne(newSqueal);
            return;
        }

        // if the squeal is found, delete it
        const result = await collection.deleteOne({ id: squealId });
        res.status(200).json({ message: "squeal deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
 
    }
});*/

//* POST
// solo per admin -> modifica quello che vuole (tranne id)
// the admin has the power to break all logics, use carefully

// TODO TEST THE FUNCTION
app.post("/squeals/:id", bodyParser.json(), async (req, res) => {
    try {
        if (/*await isAuthorized(req.session.user, typeOfProfile.admin)*/ true) {
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
            if(update.positive_reactions !== undefined && update.negative_reactions !== undefined && update.impressions !== undefined && update.impressions !== 0 && update.positive_reactions !== NaN && update.negative_reactions !== NaN && update.impressions !== NaN) {
                update.pos_popolarity_ratio = update.positive_reactions / update.impressions;
                update.neg_popolarity_ratio = update.negative_reactions / update.impressions;
            }


            mongoClient.connect();
            // fetching the squeal with the given id
            const squeal = await collection.findOne({
                id: squealId
            });

            // if the squeal is not found, return 404
            if (squeal === null) {
                res.status(404).json({
                    message: "squeal not found"
                });
                return;
            }

            mongoClient.connect();
            // if the squeal is found, update it
            const result = await collection.updateOne({
                id: squealId
            }, {
                $set: update
            });
            res.status(200).json({
                message: "squeal updated successfully"
            });
        } else {
            res.status(403).send();
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
        const squeal = await collection.findOne({
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
        const squeal = await collection.findOne({
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
        const main_squeal = await collection.findOne({
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

        // fetching the replies
        for (const child_squeal_id of idsOfSquealRepliesToReturn) {
            child_squeal = await collection.findOne({
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

//* GET UNTESTED
// ritorna la lista di utenti che hanno reagito allo squeal con id = id ricevuto come parametro

// TODO TEST THE FUNCTION
app.get("/squeals/:id/:reaction_list", async (req, res) => {
    try {
        const squealId = req.params.id;
        const reactions = req.params.reaction_list;

        // check if the reaction list is valid
        if (reactions != "positive_reactions_users" && reactions != "negative_reactions_users") {
            res.status(400).json({
                message: "invalid reaction list"
            });
            return;
        }



        const reaction_list = req.params.reaction_list;

        // fetching the squeal with the given id
        const squeal = await collection.findOne({
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

//* POST UNTESTED
// aggiunge un utente alla lista di reazioni positive/negative dello squeal con id = id ricevuto come parametro
// se l'utente è già presente nella lista, lo rimuove

// TODO TEST THE FUNCTION
app.post("/squeals/:id/:reaction_list", bodyParser.json(), async (req, res) => {
    try {
        const squealId = req.params.id;
        const reactions = req.params.reaction_list;

        // check if the reaction list is valid
        if (reactions != "positive_reactions_users" && reactions != "negative_reactions_users") {
            res.status(400).json({
                message: "invalid reaction list"
            });
            return;
        }

        // assign the correct variables for updating the correct lists
        if (reactions == "positive_reactions_users") {
            const reaction_num = "positive_reactions";
            const reaction_ratio = "pos_popolarity_ratio";
        }
        if (reactions == "negative_reactions_users") {
            const reaction_num = "negative_reactions";
            const reaction_ratio = "neg_popolarity_ratio";
        }

        // check if the user is logged in
        if (req.session.user === undefined) {
            res.status(403).json({
                message: "you must be logged in to react to a squeal"
            });
            return;
        }

        // fetching the squeal with the given id
        const squeal = await collection.findOne({
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

        const result = await collection.updateOne({
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

/* -------------------------------------------------------------------------- */
/*                          /SQUEALS/:ID/IMPRESSIONS                          */
/*                                 GET & POST                                 */
/* -------------------------------------------------------------------------- */

//* GET UNTESTED
// ritorna il numero di impressioni dello squeal con id = id ricevuto come parametro

//TODO TEST THE FUNCTION
app.get("/squeals/:id/impressions", async (req, res) => {
    try {
        const squealId = req.params.id;

        // fetching the squeal with the given id
        const squeal = await collection.findOne({
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
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    } finally {
        await mongoClient.close()
    }
});

//* POST UNTESTED
// aggiunge un' impressione allo squeal con id = id ricevuto come parametro

//TODO TEST THE FUNCTION
app.post("/squeals/:id/impressions", async (req, res) => {
    try {
        const squealId = req.params.id;

        // fetching the squeal with the given id
        const squeal = await collection.findOne({
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
        const result = await collection.updateOne({
            id: squealId
        }, {
            $set: squeal.impressions,
            $set: squeal.pos_popolarity_ratio,
            $set: squeal.neg_popolarity_ratio
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    } finally {
        await mongoClient.close()
    }
});