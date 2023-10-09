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
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna una lista di profili paginati

//? get query details from Matilde
//TODO ADD QUERY PARAMETERS AND FUNCTIONALITY
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

        let search = {};

        await mongoClient.connect();
        const profiles = await collection.find(search)
            .sort({
                timestamp: -1
            }) // ordered inverse chronological order
            .skip(startIndex) // starting from startIndex
            .limit(endIndex) // returns endIndex squeals
            .toArray(); // returns the squeals as an array

        res.status(200).json(profiles); // returns the squeals
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }
});