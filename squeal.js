global.rootDir = __dirname;

const { app, mongoClient } = require("./index.js");
const bodyParser = require('body-parser');
const dbName = "SquealerDB";
const squealCollection = "Squeals";

// ritorna una lista di squeal del database, da startindex ad endindex
// bisogna specificare l'autore degli squeal
app.get("/squeals/", async (req, res) => {
    try {
        // take the parameters from the request
        let author = req.query.author;
        let startIndex = parseInt(req.query.startindex);
        let endIndex = parseInt(req.query.endindex);

        // check if the parameters are valid
        if (author === undefined || startIndex === undefined || startIndex === NaN || endIndex === undefined || endIndex === NaN) {
            res.status(400).json({ message: "author, startindex and endindex are required" });
            return;
        }

        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
        const squeals = await collection.find({ author }) // returns the squeals made by author
            .sort({ timestamp: -1 }) // ordered inverse chronological order
            .skip(startIndex) // starting from startIndex
            .limit(endIndex); // returns endIndex squeals
        res.status(200).json(squeals); // returns the squeals

    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongoClient.close();
    }
})

// aggiunge/sovrascrive uno squeal al database
//todo controllare se l'utente è loggato
app.put("/squeals/", bodyParser.json(), async (req, res) => {
    try {
        const requiredFields = [
            "id",
            "author",
            "text",
            "receiver"
        ];

        // Check if all required fields are present in the request body
        for (const field of requiredFields) {
            if (req.body[field] === undefined) {
                res.status(400).json({ message: `${field} is required` });
                return;
            }
        }
        // If all required fields are present, continue with the insertion

        // defining the required fields as well as initializing the standard fields
        let newSqueal = {
            id: req.body.id,
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

        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);

        // Insert the new squeal in the database while converting it to a JSON string
        const result = await collection.insertOne(JSON.stringify(newSqueal));

        console.log('Documento inserito con successo:', result.insertedId);
        res.status(200).json({ message: "squeal added successfully with db id:" + result.insertedId });
    } catch (errore) {
        console.error('Errore durante l inserimento del documento: ', errore);
    } finally {
        await mongoClient.close(); // Chiudi la connessione al database quando hai finito
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