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
    CREDIT_LIMITS
} = require("./const.js");

// connecting to the database
mongoClient.connect();
const database = mongoClient.db(dbName);
const collection_for_squeals = database.collection(squealCollection);
const collection = database.collection(profileCollection);

/* -------------------------------------------------------------------------- */
/*                                 /PROFILES/                                 */
/*                                GET & DELETE                                */
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

        const possibleGTEParams = ["credit", "credit_limits", "squeals_num",/* "followers_num",*/ "banned_until"];

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
            if (req.query[param] !== undefined) {
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
        let profiles = await collection.find(search)
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

//* DELETE
// cancella tutti i profili che soddisfano la query (necessaria autenticazione, solo admin)
// query supportate: vedi GET, stesso codice, senza startIndex e endIndex

//TODO ADD AUTHORIZATION
//TODO TEST THE FUCTION
app.delete("/profiles/", async (req, res) => {
    try {

        const possibleParams = ["name", "bio", "account_type"];

        const possibleGTEParams = ["credit", "credit_limits", "squeals_num",/* "followers_num",*/ "banned_until"];

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
            if (req.query[param] !== undefined) {
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
        if (Object.keys(search).length === 0) {
            res.status(400).json({
                message: "No query specified"
            });
            return;
        }

        if (authorized) {
            mongoClient.connect();
            const result = await collection.deleteMany(search);
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Profiles deleted: " + result.deletedCount
                });
            } else {
                res.status(404).json({
                    message: "No profiles found"
                });
            }
        } else {
            res.status(401).json({
                message: "Unauthorized"
            });
        }
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
        const profile = await collection.findOne({
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

// TODO TEST THE FUNCTION
app.put("/profiles/:name", async (req, res) => {
    try {
        // setting up info for the new profile
        const profileName = req.params.name;
        profile.name = profileName;
        const profile = req.body;

        profile.followers_list = [];
        profile.following_list = [];
        profile.squeals_list = [];
        profile.squeals_num = 0;
        profile.credit = CREDIT_LIMITS;
        profile.credit_limits = CREDIT_LIMITS;
        profile.is_banned = false;
        profile.banned_until = null;
        const allowedAccountTypes = ["normal", "admin", "premium", "smm"];
        if (!allowedAccountTypes.includes(profile.account_type)) {
            profile.account_type = "normal";
        }
        if (profile.propic === undefined) {
            // STOCK PROFILE PIC
            profile.propic === "SOME URI";
        }
        if (profile.bio === undefined) {
            profile.bio = "";
        }

        // checking if there's missing info
        if (profile.password === undefined || profile.email === undefined) {
            res.status(400).json({
                message: "Missing password or email"
            });
            return;
        }

        console.log(JSON.stringify(profile));

        await mongoClient.connect();
        const existingProfile = await collection.findOne({
            name: profile.name
        });

        if (existingProfile == null) {
            const result = await collection.insertOne(profile);

            if (result != null) {
                res.status(201).json({
                    message: "Profile created"
                });
            } else {
                res.status(500).json({
                    message: "Failed to create profile"
                });
            }
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

// ? how do we handle dependencies? there are many (squeals, followers, following)
// TODO ADD AUTHORIZATION
// TODO TEST THE FUNCTION
app.delete("/profiles/:name", async (req, res) => {
    try {
        const profileName = req.params.name;
        const authorized = true; /*isAuthorized(req, "admin");*/

        if (authorized) {
            await mongoClient.connect();
            const result = await collection.deleteOne({
                name: profileName
            });
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Profile deleted"
                });
            } else {
                res.status(404).json({
                    message: "Profile not found"
                });
            }
        } else {
            res.status(401).json({
                message: "Unauthorized"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

//* POST
// modifica il profilo con nome name
// ritorna 404 se non esiste
// ritorna 401 se non sei autorizzato
// ritorna 400 se mancano informazioni necessarie
// SOLO ADMIN

// TODO ADD AUTHORIZATION
// TODO TEST THE FUNCTION
app.post("/profiles/:name", async (req, res) => {
    try {
        // setting up info for the updated profile
        const profileName = req.params.name;
        const authorized = true; /*isAuthorized(req, "admin");*/

        if (!authorized) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }

        await mongoClient.connect();
        const exists = await collection.findOne({ name: profileName });
        // checking if the profile exists
        if (!exists) {
            res.status(404).json({
                message: "Profile does not exist"
            });
            return;
        }

        // changing name messes up with dependencies, i don't wanna tackle that
        const possibleParams = ["bio", "account_type", "propic", "credit", "credit_limits", "is_banned", "banned_until"];
        let profile = {};
        for (const param of possibleParams) {
            if (req.body[param] !== undefined) {
                profile[param] = req.body[param];
            }
        }
        const allowedAccountTypes = ["normal", "admin", "premium", "smm"];
        if (!allowedAccountTypes.includes(profile.account_type)) {
            delete profile.account_type;
        }

        await mongoClient.connect();
        const result = await collection.updateOne(profile);

        if (result.upsertedCount > 0) {
            res.status(201).json({
                message: "Profile updated"
            });
        } else {
            res.status(409).json({
                message: "error updating profile"
            });
        }
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
        const profile = await collection.findOne({
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