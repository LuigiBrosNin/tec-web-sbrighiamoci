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
    CREDIT_LIMITS
} = require("./const.js");

// connecting to the database
mongoClient.connect();
const database = mongoClient.db(dbName);
const collection_squeals = database.collection(squealCollection);
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

        let search = {};

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
            name: profileName
        });

        if (profile !== null) {
            delete profile.password;
            delete profile.email;
            res.status(200).json(profile);
        } else {
            res.status(404).json({
                message: "Profile not found"
            });
        }
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
        const profile = {
            name: name,
            followers_list: [],
            following_list: [],
            squeals_list: [],
            squeals_num: 0,
            credit: CREDIT_LIMITS,
            credit_limits: CREDIT_LIMITS,
            is_banned: false,
            banned_until: null,
        };

        const allowedAccountTypes = ["normal", "admin", "premium", "smm"];
        if (!allowedAccountTypes.includes(profile.account_type)) {
            profile.account_type = "normal";
        }
        if (profile.propic === undefined) {
            // STOCK PROFILE PIC
            profile.propic === "SOME URI"; //! TEMP, CHANGE TO STOCK URI ONCE WE HAVE IT
        }
        if (profile.bio === undefined) {
            profile.bio = "";
        }

        // checking if there's missing info
        if (profile.password == null || profile.password === "" || profile.email == null || profile.email === "") { //// the check var == null is equivalent to var === null && var === undefined
            res.status(400).json({
                message: "Missing password or email"
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

//* DELETE
// cancella il profilo con nome name
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato

// ? handle dependencies (squeals, followers, following, channels mod list)
//TODO FUTURE LUIZO: ADD DIPENDENCIES
app.delete("/profiles/:name", async (req, res) => {
    try {
        const profileName = req.params.name;
        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);
        const authorized = true //await isAuthorizedOrHigher(req.session.user, typeOfProfile.user) && req.session.user === profileName;

        if (authorized || adminAuthorized) {
            await mongoClient.connect();
            const profile = await collection_profiles.find({ name: profileName });

            // if the profile was owning a channel, pass it to a mod; if there's no mods, reset the channel to null values
            const channels_owned = await collection_channels.find({
                $or: [
                    { owner: profileName },
                    { mods_list: profileName }
                ]
            }).toArray();
            for (const channel of channels_owned) { 
                if (channel.mods_list[0] !== "" && channel.mods_list[0] !== undefined) { // there is a mod 
                    const new_mod = channel.mods_list[0];

                    await mongoClient.connect();
                    const res = await collection_channels.updateOne(  
                        { name: channel.name },
                        {
                            $set: {
                                owner: new_mod
                            },
                            $pull: {
                                mods_list: new_mod
                            }
                        }
                    );
                }
                else {  // there is no mod
                    await mongoClient.connect();
                    const res = await collection_channels.updateOne( 
                        { name: channel.name },
                        {
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
                        }
                    );
                }

                // after the channel has been either deleted or gained a new mod, remove the profile
                await mongoClient.connect();
                const res = await collection_profiles.updateOne(  
                    { name: profileName },
                    {
                        $set: {
                            email: "",
                            password: "",
                            propic: "",
                            bio: "",
                            credit: [],
                            credit_limits: [],
                            squeals_list: [],
                            followers_list: [],
                            account_type: "",
                            extra_credit: 0,
                            squeals_num: 0,
                            is_banned: false,
                            banned_until: null,
                            following_list: [],
                            is_deleted: true
                        }
                    }
                ); 
            } 
            res.status(200).json({ message: "Profile deleted successfully." });
        } else {
            res.status(401).json({ message: "Unauthorized to delete the profile." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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
        if (!exists) {
            res.status(404).json({
                message: "Profile does not exist"
            });
            return;
        }

        let possibleParams = ["bio", "propic", "password", "email"];

        // checking if the user is authorized to modify the profile
        if (adminAuthorized) {
            possibleParams = ["bio", "account_type", "propic", "credit", "credit_limits", "banned_until", "password", "email"];
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

        if (profile !== null) {
            res.status(200).json({
                followers_number: profile.followers_list.length
            });
        } else {
            res.status(404).json({
                message: "Profile not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                           /PROFILES/:NAME/FOLLOWER                         */
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


        console.log(profile.followers_list);

        if (profile !== null) {
            res.status(200).json(profile.followers_list);
        } else {
            res.status(404).json({
                message: "Profile not found"
            });
        }

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

        if (followedProfile === null || followingProfile === null) {
            res.status(404).json({
                message: "one or both profiles not found"
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
/*                           /PROFILES/:NAME/PROPIC                           */
/*                                GET, DELETE                                 */
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

        if (profile !== null) {
            res.status(200).json({
                propic: profile.propic
            });
        } else {
            res.status(404).json({
                message: "Profile not found"
            });
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

//* DELETE
// rimuove la propic del profilo con nome name
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato

//TODO ADD FILE MANAMGEMENT FOR ACTUALLY DELETE THE PROFILE PIC FILE
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

        if (profile !== null) {
            const result = await collection_profiles.updateOne({
                name: profileName
            }, {
                $set: {
                    propic: "stock uri lmao" //! ADD STOCK URI
                }
            });
            res.status(200).json({
                message: "Propic removed"
            });
        } else {
            res.status(404).json({
                message: "Profile not found"
            });
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});