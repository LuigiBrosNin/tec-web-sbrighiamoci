global.rootDir = __dirname;

const { app, mongoClient } = require("./index.js");
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

// aggiungere uno squeal al database
//todo controllare il contenuto del req.body per verificare se il contenuto è corretto
//todo controllare se l'utente è loggato
/* required fields for req.body:
"id", "author", "text", "receiver", "date", "positive_reactions", "positive_reactions_users", "negative_reactions", "negative_reactions_users", "media", "reply_to", "replies_num", "replies", "keywords", "mentions", "impressions"
*/
app.put("/squeals", bodyParser.json(), async (req, res) => {
    try {
        const requiredFields = [
            "id",
            "author",
            "text",
            "receiver",
            "date",
            "positive_reactions",
            "positive_reactions_users",
            "negative_reactions",
            "negative_reactions_users",
            "media",
            "reply_to",
            "replies_num",
            "replies",
            "keywords",
            "mentions",
            "impressions"
        ];

        // Check if all required fields are present in the request body
        for (const field of requiredFields) {
            if (req.body[field] === undefined) {
                res.status(400).json({ message: `${field} is required` });
                return;
            }
        }
        // If all required fields are present, continue with the insertion

        await mongoClient.connect();
        const database = mongoClient.db();

        const result = await collezione.insertOne(req.body);

        console.log('Documento inserito con successo:', result.insertedId);
    } catch (errore) {
        console.error('Errore durante l inserimento del documento: ', errore);
    } finally {
        await client.close(); // Chiudi la connessione al database quando hai finito
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