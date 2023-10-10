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
// - startindex: indice di partenza per la paginazione
// - endindex: indice di fine per la paginazione
// - account_type: tipo di profilo
// - name: nome utente
// - bio: bio utente
// - credit: crediti utente (GTE)
// - credit_limits: limiti di crediti utente (GTE)
// - squeals_num: numero di squeal profilo (inclusi deleted ones nel conteggio) (GTE)
// - followers_num: numero di followers profilo (GTE)
// - banned_until: data di fine ban (GTE)
// - is_banned: utente bannato (boolean)

//TODO TEST THE FUCTION
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

        const possibleParams =[ "name", "bio", "account_type"];

        const possibleGTEParams = ["credit", "credit_limits", "squeals_num", "followers_num", "banned_until"];

        let search = {};

        // check string params
        for (const param of possibleParams) {
            if (req.query[param] !== undefined) {
                search[param] = req.query[param];
            }
        }

        // check int params
        for (const param of possibleGTEParams) {
            if (req.query[param] !== undefined && req.query[param] !== NaN && req.query[param] !== "followers_num") {
                search[param] = {
                    $gte: parseInt(req.query[param])
                };
            } else if (req.query[param] === "followers_num") {
                search["followers_list"] = {
                    $size: {$gte: req.query[param]}
                };
            }
        }

        // check boolean param
        if (req.query["is_banned"] !== undefined) {
            search["is_banned"] = req.query["is_banned"] === "true";
        }

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
        const possibleParams =[ "name", "bio", "account_type"];

        const possibleGTEParams = ["credit", "credit_limits", "squeals_num", "followers_num", "banned_until"];

        let search = {};

        //TODO ADD AUTHORIZATION
        let authorized = true;

        // check string params
        for (const param of possibleParams) {
            if (req.query[param] !== undefined) {
                search[param] = req.query[param];
            }
        }

        // check int params
        for (const param of possibleGTEParams) {
            if (req.query[param] !== undefined && req.query[param] !== NaN && req.query[param] !== "followers_num") {
                search[param] = {
                    $gte: parseInt(req.query[param])
                };
            } else if (req.query[param] === "followers_num") {
                search["followers_list"] = {
                    $size: {$gte: req.query[param]}
                };
            }
        }

        // check boolean param
        if (req.query["is_banned"] !== undefined) {
            search["is_banned"] = req.query["is_banned"] === "true";
        }

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

// TODO TEST THE FUCTION
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