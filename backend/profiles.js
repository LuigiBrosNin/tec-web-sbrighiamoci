const {
    parse
} = require("path");
const multer = require('multer');
const stream = require('stream');
const sharp = require('sharp');
const fs = require('fs');
const axios = require('axios');
const upload = multer({
    storage: multer.memoryStorage()
});
const { GridFSBucket, ObjectId } = require('mongodb');
const {
    app
} = require("../index.js");
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
    CREDIT_LIMITS,
    importPic,
    exportPic
} = require("./const.js");

// connecting to the database
mongoClient.connect();
const database = mongoClient.db(dbName);
const collection_profiles = database.collection(profileCollection);
const collection_channels = database.collection(channelCollection);

/* -------------------------------------------------------------------------- */
/*                                 /PROFILES/                                 */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna una lista di profili paginati, supporta query
// campi supportati:
// - startindex: indice di partenza per la paginazione (DEFAULT 0)
// - endindex: indice di fine per la paginazione (DEFAULT 10)
// - account_type: tipo di profilo
// - name: nome utente
// - bio: bio utente
// - credit: crediti utente (GTE)
// - credit_type: tipo di crediti (0,1,2) (g,s,m) (DEFAULT 0)
// - credit_limits: limiti di crediti utente (GTE)
// - credit_limits_type: tipo di crediti (0,1,2) (g,s,m) (DEFAULT 0)
// - squeals_num: numero di squeal profilo (inclusi deleted ones nel conteggio) (GTE)
// - followers_num: numero di followers profilo (GTE) (NOT IMPLEMENTED DUE TO MONGODB SEARCH LIMITATIONS)
// - banned_until: data di fine ban (GTE)
// - is_banned: utente bannato (boolean)
app.get("/profiles/", async (req, res) => {
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

        const possibleParams = ["name", "bio", "account_type"];

        const possibleGTEParams = ["credit", "credit_limits", "squeals_num", /* "followers_num",*/ "banned_until"];

        let search = {
            is_deleted: false
        };

        let credit_type = 0;
        let credit_limits_type = 0;

        // check credit type search
        if (req.query.credit_type !== undefined && req.query.credit_type !== NaN && req.query.credit_type !== "0" && req.query.credit_type !== "1" && req.query.credit_type !== "2") {
            credit_type = parseInt(req.query.credit_type);
        } else {
            credit_type = 0;
        }

        // check credit limits type search
        if (req.query.credit_limits_type !== undefined && req.query.credit_limits_type !== NaN && req.query.credit_limits_type !== "0" && req.query.credit_limits_type !== "1" && req.query.credit_limits_type !== "2") {
            credit_limits_type = parseInt(req.query.credit_limits_type);
        } else {

            credit_limits_type = 0;
        }

        console.log("credit_type: " + credit_type);
        console.log("credit_limits_type: " + credit_limits_type);

        // check string params
        for (const param of possibleParams) {
            if (req.query[param] !== undefined && req.query[param] !== "") {
                search[param] = req.query[param];
            }
        }

        // check int params
        for (const param of possibleGTEParams) {
            if (req.query[param] !== undefined && req.query[param] !== NaN && param != "followers_num" && param != "credit" && param != "credit_limits") {
                search[param] = {
                    $gte: parseInt(req.query[param])
                };
            } // handling followers_num 
            /*            else if (req.query[param] !== undefined && req.query[param] !== NaN && param === "followers_num") {
                            search["followers_list"] = {
                                $gte: {
                                    $size: parseInt(req.query[param])
                                }
                            };
                        }*/ // handling credit_limits
            else if (req.query[param] !== undefined && req.query[param] !== NaN && param === "credit_limits") {
                search["credit_limits"] = {
                    $gte: parseInt(req.query[param])
                };
            } // handling credit
            else if (req.query[param] !== undefined && req.query[param] !== NaN && param === "credit") {
                console.log("right");
                search["credit." + credit_type] = {
                    $gte: parseInt(req.query[param])
                };
            }

        }

        // check boolean param
        if (req.query["is_banned"] !== undefined) {
            search["is_banned"] = req.query["is_banned"] === "true";
        }

        console.log(JSON.stringify(search));

        await mongoClient.connect();
        let profiles = await collection_profiles.find(search)
            .sort({
                timestamp: -1
            }) // ordered inverse chronological order
            .skip(startIndex) // starting from startIndex
            .limit(endIndex) // returns endIndex squeals
            .toArray(); // returns the squeals as an array

        // removing sensitive data
        profiles.forEach(profile => {
            delete profile.password;
            delete profile.email;
        });

        res.status(200).json(profiles); // returns the squeals
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});

/* -------------------------------------------------------------------------- */
/*                               /PROFILES/:NAME                              */
/*                            GET, PUT, DELETE, POST                          */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna il profilo con nome name
// ritorna 404 se non esiste
app.get("/profiles/:name", async (req, res) => {
    try {
        const profileName = req.params.name;

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName,
            is_deleted: false
        });

        if (profile === null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        delete profile.password;
        res.status(200).json(profile);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

//* PUT
// crea il profilo con nome name
// ritorna 409 se esiste già
// ritorna 400 se mancano informazioni
app.put("/profiles/:name", async (req, res) => {
    try {

        // setting up info for the new profile
        const name = req.params.name;

        // check if there is another profile with the same name, in that case deny the creation
        const already_taken = await collection_profiles.findOne({
            $or: [{
                    name: name
                },
                {
                    email: req.body.email
                }
            ]
        });
        if (already_taken !== null) {
            res.status(409).json({
                message: "Name or email already taken."
            });
            return;
        }

        const profile = {
            name: name,
            email: req.body.email,
            password: req.body.password,
            account_type: "normal",
            bio: req.body.bio,
            followers_list: [],
            following_list: [],
            following_channels: [],
            squeals_list: [],
            squeals_num: 0,
            credit: CREDIT_LIMITS,
            credit_limits: CREDIT_LIMITS,
            is_banned: false,
            banned_until: null,
            is_deleted: false,
            propic: null,
        };
        console.log(JSON.stringify(profile))
        
        if (profile.bio == undefined) {
            profile.bio = "";
        }

        // checking if there's missing info
        if (profile.password == null || profile.password === "" || !isValidEmail(profile.email)) { //// the check var == null is equivalent to var === null && var === undefined
            res.status(400).json({
                message: "Missing/invalid password or email"
            });
            return;
        }

        console.log(JSON.stringify(profile));

        await mongoClient.connect();
        const existingProfile = await collection_profiles.findOne({
            name: profile.name
        });

        if (existingProfile == null) {
            const result = await collection_profiles.insertOne(profile);

            res.status(200).json({
                message: "Profile created"
            });
        } else {
            res.status(409).json({
                message: "Profile already exists"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

function isValidEmail(email) {
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return regex.test(email);
}

//* DELETE
// cancella il profilo con nome name
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato

//TODO ADD AUTHORIZATION
app.delete("/profiles/:name", async (req, res) => {
    try {
        //TODO CHANGE profileName
        const profileName = req.params.name;
        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);
        const authorized = true //await isAuthorizedOrHigher(req.session.user, typeOfProfile.user) && req.session.user === profileName;


        console.log("profileName: " + req.params.name);

        if (authorized || adminAuthorized) {
            await mongoClient.connect();
            const profile = await collection_profiles.findOne({
                name: profileName
            });

            // if the profile was owning a channel, pass it to a mod; if there's no mods, reset the channel to null values
            const channels_owned = await collection_channels.find({
                $or: [{
                        owner: profileName
                    },
                    {
                        mods_list: profileName
                    }
                ]
            }).toArray();

            for (const channel of channels_owned) {
                if (channel.mods_list[0] !== "" && channel.mods_list[0] !== undefined) { // there is a mod 
                    const new_mod = channel.mods_list[0];

                    await mongoClient.connect();
                    const res = await collection_channels.updateOne({
                        name: channel.name
                    }, {
                        $set: {
                            owner: new_mod
                        },
                        $pull: {
                            mods_list: new_mod
                        }
                    });
                } else { // there is no mod
                    await mongoClient.connect();
                    const res = await collection_channels.updateOne({
                        name: channel.name
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
                }

                // after the channel has been either deleted or gained a new mod, remove the profile
                const squeal_list_to_delete = profile.squeals_list;

                for (const squeal of squeal_list_to_delete) {
                    await deleteSquealById(squeal);
                }


            }

            await mongoClient.connect();
            const updated = await collection_profiles.updateOne({
                name: profileName
            }, {
                $set: {
                    email: "",
                    password: "",
                    propic: "",
                    bio: "",
                    credit: [],
                    credit_limits: [],
                    squeals_list: [],
                    followers_list: [],
                    following_channels: [],
                    account_type: "",
                    extra_credit: 0,
                    squeals_num: 0,
                    is_banned: false,
                    banned_until: null,
                    following_list: [],
                    is_deleted: true
                }
            });

            res.status(200).json({
                message: "Profile deleted successfully."
            });
        } else {
            res.status(401).json({
                message: "Unauthorized to delete the profile."
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

async function deleteSquealById(squealId) {
    fetch("http://localhost:8000/squeals/" + squealId, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => {
        if (res.ok) {
            console.log(res.json());
        } else {
            throw new Error("Error in db network");
        }
    });
}

//* POST
// modifica il profilo con nome name
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato
// ritorna 400 se mancano informazioni necessarie
// Parametri supportati: bio, account_type, propic, credit, credit_limits, is_banned, banned_until, password, email
// Parametri modificabili da utenti: bio, propic, password, email
app.post("/profiles/:name", async (req, res) => {
    try {
        // setting up info for the updated profile
        const profileName = req.params.name;
        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.user) && req.session.user === profileName;

        if (!authorized && !adminAuthorized) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const exists = await collection_profiles.findOne({
            name: profileName
        });

        // checking if the profile exists
        if (exists.is_deleted || exists === null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        let possibleParams = ["bio", "propic", "password", "email"];

        // checking if the user is authorized to modify the profile
        if (adminAuthorized) {
            possibleParams = ["bio", "account_type", "credit", "credit_limits", "banned_until", "password", "email"];
        }
        let profile = {};
        for (const param of possibleParams) {
            if (param === "banned_until" && req.body[param] !== undefined && req.body[param] !== "") {
                profile[param] = parseInt(req.body[param]);
            } else if (req.body[param] !== undefined && req.body[param] !== "") {
                profile[param] = req.body[param];
            }
        }

        // boolean check for admins
        if (adminAuthorized) {
            if (req.body.is_banned === "true" || req.body.is_banned === true) {
                profile.is_banned = true;
            } else if (req.body.is_banned === "false" || req.body.is_banned === false) {
                profile.is_banned = false;
            }
        }

        const allowedAccountTypes = ["normal", "admin", "premium", "smm"];
        if (!allowedAccountTypes.includes(profile.account_type)) {
            delete profile.account_type;
        }

        console.log(JSON.stringify(profile));

        const result = await collection_profiles.updateOne({
            name: profileName
        }, {
            $set: profile
        });

        res.status(201).json({
            message: "Profile updated"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                        /PROFILES/:NAME/FOLLOWERSNUMBER                     */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna il numero di followers del profilo con nome name
// ritorna 404 se non esiste
app.get("/profiles/:name/followersnumber", async (req, res) => {
    try {
        const profileName = req.params.name;

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile === null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        res.status(200).json({
            followers_number: profile.followers_list.length
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                           /PROFILES/:NAME/FOLLOWERS                        */
/*                                   GET, PUT                                 */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna la lista dei followers del profilo con nome name
// ritorna 404 se il profilo non esiste
app.get("/profiles/:name/followers", async (req, res) => {
    try {
        const profileName = req.params.name;

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile === null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        res.status(200).json(profile.followers_list);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


//* PUT
// aggiunge il follower followerName al profilo con nome name
// utente della sessione si aggiunge alla lista di un utente (altro)
// rimuove il follower followerName dal profilo con nome name se presente
// ritorna 404 se il profilo non esiste
// ritorna 401 se non autorizzato (login non effettuato)
app.put("/profiles/:name/followers/", async (req, res) => {
    try {
        const profileName = req.params.name;
        const followerName = req.session.user; // if this is undefined, then authorized is false
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.user);

        if (!authorized) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const followedProfile = await collection_profiles.findOne({
            name: profileName
        });
        const followingProfile = await collection_profiles.findOne({
            name: followerName
        });

        if (followedProfile.is_deleted || followedProfile === null) {
            res.status(404).json({
                message: "the Profile you want to follow wasn't found."
            });
            return;
        }

        if (followingProfile.is_deleted || followingProfile === null) {
            res.status(404).json({
                message: "the profile you're following with wasn't found"
            });
            return;
        }

        console.log(profileName + " followed profile list:" + followedProfile.followers_list);
        console.log(followerName + " following profile list:" + followingProfile.following_list);

        if (followedProfile.followers_list.includes(followerName)) {
            //remove the follower from the list
            followedProfile.followers_list.splice(followedProfile.followers_list.indexOf(followerName), 1);
            followingProfile.following_list.splice(followingProfile.following_list.indexOf(profileName), 1);

            await collection_profiles.updateOne({
                name: profileName
            }, {
                $set: {
                    followers_list: followedProfile.followers_list
                }
            });

            await collection_profiles.updateOne({
                name: followerName
            }, {
                $set: {
                    following_list: followingProfile.following_list
                }
            });

            res.status(200).json({
                message: "Follower removed"
            });
        } else { // add the follower to the list
            await collection_profiles.updateOne({
                name: profileName
            }, {
                $push: {
                    followers_list: followerName
                }
            });

            await collection_profiles.updateOne({
                name: followerName
            }, {
                $push: {
                    following_list: profileName
                }
            });

            res.status(200).json({
                message: "Follower added"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                       /PROFILES/:NAME/FOLLOWING_CHANNELS                   */
/*                                   GET, PUT                                 */
/* -------------------------------------------------------------------------- */
//* GET
// ritorna la lista dei canali seguiti dal profilo con nome name
// ritorna 404 se il profilo non esiste
app.get("/profiles/:name/following_channels", async (req, res) => {
    try {
        const profileName = req.params.name;

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile === null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        res.status(200).json(profile.following_channels);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

//* PUT
// aggiunge il canale channelName al profilo con nome name, oppure lo rimuove se già presente
// aggiunge il nome utente alla lista di iscritti dei canali
// ritorna 404 se il profilo non esiste
// ritorna 401 se non autorizzato (login non effettuato)
// body: channel_name
app.put("/profiles/:name/following_channels/", async (req, res) => {
    try {
        const profileName = req.params.name;
        const channelName = req.body.channel_name;
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.user);

        if (!authorized) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile === null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        // do the same operation above but for the channel list ;)
        const channel = await collection_channels.findOne({
            name: channelName
        })

        if (channel.is_deleted || channel === null) {
            res.status(404).json({
                message: "The channel does not exist."
            });
            return;
        }


        if (profile.following_channels.includes(channelName)) {
            //remove the channel from the list
            profile.following_channels.splice(profile.following_channels.indexOf(channelName), 1);
            await collection_profiles.updateOne({
                name: profileName
            }, {
                $set: {
                    following_channels: profile.following_channels
                },
            });
            res.status(200).json({
                message: "Channel removed from the list"
            });
        } else { // add the channel to the list
            await collection_profiles.updateOne({
                name: profileName
            }, {
                $push: {
                    following_channels: channelName
                }
            });
            res.status(200).json({
                message: "Channel added to the list"
            });
        }


        // find out if the user is already subscribed
        const subscribersList = channel.subscribers_list;
        let subscribed = false;
        for (const reply of subscribersList) {
            if (reply === profileName) {
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
                    subscribers_list: profileName
                },
                $inc: {
                    subscribers_num: -1
                }
            });

            await collection_profiles.updateOne({
                name: profileName
            }, {
                $pull: {
                    following_list: channel.name
                }
            });
            res.status(200).json({
                message: "User unsubscribed successfully."
            })
        } // not subscribed 
        else {
            await collection_channels.updateOne({
                name: channel.name
            }, {
                $addToSet: {
                    subscribers_list: profileName
                },
                $inc: {
                    subscribers_num: 1
                }
            });
            await collection_profiles.updateOne({
                name: profileName
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
});

/* -------------------------------------------------------------------------- */
/*                           /PROFILES/:NAME/PROPIC                           */
/*                              GET, PUT, DELETE                              */
/* -------------------------------------------------------------------------- */


//* GET
// ritorna la propic del profilo con nome name
// ritorna 404 se non esiste
app.get("/profiles/:name/propic", async (req, res) => {
    try {
        const profileName = req.params.name;

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile === null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        exportPic(profile.propic, res);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});



//* PUT
// cambia la propic del profilo con nome name
// caricando un file nel database nel campo propic (req.file)

//TODO ADD AUTHORIZATION
app.put('/profiles/:name/propic', upload.single('file'), async (req, res) => {
    try {
        const authorized = true;

        if (!authorized) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ message: 'No file selected' });
            return;
        }

        const profileName = req.params.name;

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if(profile.is_deleted || profile === null) {
            res.status(404).json({ message: 'Profile not found.' });
            return;
        }

        importPic(req.file, collection_profiles, profileName);

        res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


    /*
    upload(req, res, async (err) => {
        if (err) {
            res.status(500).json({
                message: err.message
            });
        } else {
            if (req.file == undefined) {
                res.status(400).json({
                    message: 'No file selected'
                });
            } else if (!req.file.mimetype.startsWith('image/')) {
                res.status(400).json({
                    message: 'File is not an image'
                });
            } else {
                // Resize the image to 512x512
                const outputPath = __dirname + 'images/' + req.file.filename;
                await sharp(req.file.path)
                    .resize(512, 512)
                    .toFile(outputPath);

                res.status(200).json({
                    message: 'File uploaded and resized successfully',
                    fileName: req.file.filename
                });
            }
        }
    });*/

//* DELETE
// rimuove la propic del profilo con nome name
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato

app.delete("/profiles/:name/propic", async (req, res) => {
    try {
        const profileName = req.params.name;
        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.user) && req.session.user === profileName;

        if (!authorized && !adminAuthorized) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile === null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        const result = await collection_profiles.updateOne({
            name: profileName
        }, {
            $set: {
                propic: null
            }
        });
        res.status(200).json({
            message: "Propic removed"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                         /PROFILES/:NAME/ACCOUNT_TYPE                       */
/*                                GET, PUT, POST                              */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna il tipo di account del profilo con nome name
// ritorna 404 se non esiste
app.get("/profiles/:name/account_type", async (req, res) => {
    try {
        const profileName = req.params.name;

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile == null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        res.status(200).json({
            account_type: profile.account_type
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
);

//* PUT
// cambia il tipo di account del profilo con nome name
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato
// body: account_type
app.put("/profiles/:name/account_type", async (req, res) => {
    try {
        const profileName = req.params.name;
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.user);

        if (!authorized) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile == null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        // hypotetically, here a check should be implemented to process the payment
        // since we don't have a payment system, we do nothing and keep going

        const allowedAccountTypes = ["normal", "premium", "smm"];
        if (!allowedAccountTypes.includes(req.body.account_type)) {
            res.status(400).json({
                message: "Invalid account type"
            });
            return;
        }

        const authData = {
            // Provide authentication data
            username: "SquealerTechnician",
            password: "tecpw"
        };

        await axios.post('https://site222326.tw.cs.unibo.it/login', authData);

        const op = await axios.post('https://site222326.tw.cs.unibo.it/profiles/' + profileName + '/account_type', {
            account_type: req.body.account_type
        }).then(resPost => {
            if(resPost.status == 200) {
                res.status(200).json({
                    message: "Account type changed"
                });
            } else {
                res.status(400).json({
                    message: "Something went wrong :("
                });
            }
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

async function switchAccountType(profileName, newAccountType) {
    try {
        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        // if the profile was premium or smm, clear dependencies
        switch (profile.account_type) {
            case "premium":
                if (profile.smm !== "") {
                    axios.delete('https://site222326.tw.cs.unibo.it/profiles/' + profile.smm + '/smm', {
                        data: {
                            smm_name: profile.smm
                        }
                        });
                    }
                break;
            case "smm":
                for (const customer of profile.smm_customers) {
                    axios.delete('https://site222326.tw.cs.unibo.it/profiles/' + customer + '/smm', {
                        data: {
                            smm_name: profileName
                        }
                    });
                }
                break;
        }

        switch (newAccountType) {
            case "normal":
                await collection_profiles.updateOne({
                    name: profileName
                }, {
                    $set: {
                        account_type: "normal",
                    },
                    $unset: {
                        smm: "",
                        smm_customers: []
                    }
                });
                return true;
            case "premium":
                await collection_profiles.updateOne({
                    name: profileName
                }, {
                    $set: {
                        account_type: "premium",
                        smm: "",
                    }
                });
                return true;
            case "smm":
                await collection_profiles.updateOne({
                    name: profileName
                }, {
                    $set: {
                        account_type: "smm",
                        smm_customers: []
                    }
                });
                return true;
            case "admin":
                await collection_profiles.updateOne({
                    name: profileName
                }, {
                    $set: {
                        account_type: "admin",
                    }
                });
                return true;
            default:
                return false;
            }
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

//* POST
// cambia il tipo di account del profilo con nome name
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato
// solo admin
// body: account_type
app.post("/profiles/:name/account_type", async (req, res) => {
    try {
        const profileName = req.params.name;
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);

        if (!authorized) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });

        if (profile.is_deleted || profile == null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        const allowedAccountTypes = ["normal", "admin", "premium", "smm"];
        if (!allowedAccountTypes.includes(req.body.account_type)) {
            res.status(400).json({
                message: "Invalid account type"
            });
            return;
        }

        if (await switchAccountType(profileName, req.body.account_type)) {
            console.log("Account type changed")
            res.status(200).json({
                message: "Account type changed"
            });
        } else {
            console.log("Something went wrong")
            res.status(400).json({
                message: "Something went wrong :("
            });
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                             /PROFILES/:NAME/SMM                            */
/*                                 PUT, DELETE                                */
/* -------------------------------------------------------------------------- */

//* PUT
// aggiunge il profilo con nome name alla lista dei clienti del profilo smm
// specificato nel body
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato
// premium user has to be the one who adds the smm
// body: smm
app.put("/profiles/:name/smm", async (req, res) => {
    try {
        const profileName = req.params.name;
        const smmName = req.body.smm;
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.premium);
        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);

        if (!authorized || (req.session.user != profileName && !adminAuthorized)) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });
        const smm = await collection_profiles.findOne({
            name: smmName
        });

        if (profile.is_deleted || profile == null) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        if (smm.is_deleted || smm == null) {
            res.status(404).json({
                message: "SMM not found."
            });
            return;
        }

        if (profile.account_type !== "premium") {
            res.status(400).json({
                message: "This profile is not premium."
            });
            return;
        }

        if (smm.account_type !== "smm") {
            res.status(400).json({
                message: "This profile is not an SMM."
            });
            return;
        }

        if (smm.smm_customers.includes(smmName)) {
            res.status(400).json({
                message: "This profile is already a customer of this SMM."
            });
            return;
        }

        await collection_profiles.updateOne({
            name: profileName
        }, {
            $set: {
                smm: smmName
            }
        });

        await collection_profiles.updateOne({
            name: smmName
        }, {
            $push: {
                smm_customers: profileName
            }
        });

        res.status(200).json({
            message: "Customer added"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

//* DELETE
// rimuove il profilo con nome name dalla lista dei clienti del profilo smm
// specificato nel body
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato
// both can remove the smm
app.delete("/profiles/:name/smm", async (req, res) => {
    try {
        const profileName = req.params.name;
        const authorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.premium) || await isAuthorizedOrHigher(req.session.user, typeOfProfile.smm);
        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);


        if (!authorized || (req.session.user != profileName && !adminAuthorized) || (req.session.user != smmName && !adminAuthorized)) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const profile = await collection_profiles.findOne({
            name: profileName
        });        

        if (profile == null || profile.is_deleted) {
            res.status(404).json({
                message: "Profile not found."
            });
            return;
        }

        if(profile.account_type !== "premium") {
            res.status(400).json({
                message: "This profile is not premium."
            });
            return;
        }

        const smmName = profile.smm;

        const smm = await collection_profiles.findOne({
            name: smmName
        });

        if (smm == null || smm.is_deleted) {
            res.status(404).json({
                message: "SMM not found."
            });
            return;
        }

        if (!profile.smm_customers.includes(smmName)) {
            res.status(400).json({
                message: "This profile is not a customer of this SMM."
            });
            return;
        }

        await collection_profiles.updateOne({
            name: profileName
        }, {
            $set: {
                smm: ""
            }
        });

        await collection_profiles.updateOne({
            name: smmName
        }, {
            $pull: {
                smm_customers: profileName
            }
        });

        res.status(200).json({
            message: "Customer removed"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});