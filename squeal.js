global.rootDir = __dirname;

const { app, mongoClient } = require("./index.js");
const bodyParser = require('body-parser');
const dbName = "SquealerDB";
const squealCollection = "Squeals";


/* -------------------------------------------------------------------------- */
/*                                 /SQUEALS/                                  */
/*                                 GET & PUT                                  */
/* -------------------------------------------------------------------------- */

//* GET UNFINISHED
// ritorna una lista di squeal del database, da startindex ad endindex

// Author, pos_popolarity_ratio , neg_popolarity_ratio, abs_popularity_ratio , controversals, end_date, start_date, positive_reactions, negative_reactions, impressions
// receiver (group), Keyword, Mention
app.get("/squeals/", async (req, res) => {
    try {

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
            res.status(400).json({ message: "startIndex must be less than endIndex" });
            return;
        }

        // initializing the start and end date in case they are not specified
        let start_date = 0;
        let end_date = Date.now();
        // check if the parameters are valid
        if (req.query.start_date !== undefined && req.query.start_date !== NaN) {
            start_date = new Date(req.query.start_date);
        }
        if (req.query.end_date !== undefined ) {
            end_date = new Date(req.query.end_date);
        }
        // check if the parameters are valid
        if (start_date > end_date) {
            res.status(400).json({ message: "start_date must be less than end_date" });
            return;
        }

        // possible query params
        const possibleParams = [
            "author",
            "receiver",
            "pos_popolarity_ratio",
            "neg_popolarity_ratio",
            "abs_popularity_ratio",
            "controversals",
            "positive_reactions",
            "negative_reactions",
            "impressions",
            "keywords",
            "mentions"
        ];

        // initializing the search object with the date range
        let search = {
            date: {
                $gte: start_date,
                $lte: end_date
            }
        };

        // check if any of the possible query params are present in the request body
        for (const field of possibleParams) {
            if (req.body[field] !== undefined) {
                search[field] = req.body[field];
            }
        }

        // connecting to the database and fetching the squeals
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
        const squeals = await collection.find(search)
            .sort({ timestamp: -1 }) // ordered inverse chronological order
            .skip(startIndex) // starting from startIndex
            .limit(endIndex) // returns endIndex squeals
            .toArray(); // returns the squeals as an array

        console.log('Squeals:', JSON.stringify(squeals));
        
        res.status(200).json(squeals); // returns the squeals

    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongoClient.close();
    }
})

//* PUT UNFINISHED
// aggiunge/sovrascrive uno squeal al database

// nome utente + numero squeals = ID
//TODO controllare se l'utente è loggato e se è l'autore dello squeal
//TODO aggiornare numero squeals del profilo autore
//TODO aggiornare numero e lista squeals dell'id in reply_to se presente
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
                res.status(400).json({ message: `${field} is required` });
                return;
            }
        }
        // If all required fields are present, continue with the insertion

        // defining the required fields as well as initializing the standard fields
        let newSqueal = {
            id: "TEMP",//TODO DA DEFINIRE AUTOMATICAMENTE
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

        // Insert the new squeal in the database without converting it to a JSON string
        const result = await collection.insertOne(newSqueal);

        console.log('Documento inserito con successo:', result.insertedId);
        res.status(200).send(JSON.stringify({ message: "squeal added successfully with db id:" + result.insertedId }));
    } catch (error) {
        console.error('Errore durante l inserimento del documento: ', error);
        res.status(500).send(JSON.stringify({ message: error.message }));
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


/* -------------------------------------------------------------------------- */
/*                                /SQUEALS/:ID                                */
/*                            GET, PUT, DELETE, POST                          */
/* -------------------------------------------------------------------------- */

// * GET
// ritorna lo squeal con id = id ricevuto come parametro
app.get("/squeals/:id", async (req, res) => {
    try {
        const squealId = req.params.id;

        // connecting to the database
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
        // fetching the squeal with the given id
        const squeal = await collection.findOne({ id: squealId });

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({ message: "squeal not found" });
            return;
        }

        // if the squeal is found, return it in json format
        res.status(200).json(squeal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongoClient.close();
    }
});

// * PUT
// aggiunge/sovrascrive lo squeal con id = id ricevuto come parametro

// TODO controllare se l'utente è loggato e se è l'autore dello squeal
app.put("/squeals/:id", bodyParser.json(), async (req, res) => {
    try {
        const squealId = req.params.id;

        // connecting to the database
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
        // fetching the squeal with the given id
        const squeal = await collection.findOne({ id: squealId });
        
        const requiredFields = [
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
            const result = await collection.updateOne({ id: squealId }, { $set: newSqueal });
            res.status(200).json({ message: "squeal updated successfully" });
            return;
        }
        else {
            // if the squeal is not found, add it to the database
            const result = await collection.insertOne(newSqueal);
            res.status(200).json({ message: "squeal added successfully" });
            return;
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongoClient.close();
    }
});

// * DELETE UNFINISHED
// elimina lo squeal con id = id ricevuto come parametro

// TODO cancella dal db se non ci sono reply
// TODO cancella tutti i contenuti, rimpiazza id con deletedXXXXXX e cambia il campo reply_to dei figli in replies
// TODO controllare se l'utente è loggato e se è l'autore dello squeal oppure un admin
app.delete("/squeals/:id", async (req, res) => {
    try {
        const squealId = req.params.id;

        // connecting to the database
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
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
    } finally {
        await mongoClient.close();
    }
});

//* POST UNFINISHED
// aggiunge una reazione allo squeal con id = id ricevuto come parametro

//? ho seri dubbi riguardo ai limiti di questo metodo e a che punto bisogna
//? limitare la richiesta del ricevente, ad esempio
//? bisogna limitare la differenza di 1 tra il numero di reazioni presenti e quelle ricevute?
//? realisticamente un utente loggato può aggiungere, togliere e modificare le sue reazioni
//? solo 1 volta per richiesta se il suo nome non è già nella lista delle reazioni
//? questa limitazione è solo per utenti comuni, non per admin, come la gestiamo?
// uffa
// TODO controllare se l'utente è loggato
app.post("/squeals/:id", bodyParser.json(), async (req, res) => {
    try {
        const squealId = req.params.id;

        // connecting to the database
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
        // fetching the squeal with the given id
        const squeal = await collection.findOne({ id: squealId });

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({ message: "squeal not found" });
            return;
        }

        // if the squeal is found, update it
        const result = await collection.updateOne({ id: squealId }, { $set: req.body });
        res.status(200).json({ message: "squeal updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongoClient.close();
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

        // connecting to the database
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
        // fetching the squeal with the given id
        const squeal = await collection.findOne({ id: squealId });

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({ message: "squeal not found" });
            return;
        }

        // if the squeal is found, return its media
        res.status(200).json(squeal.media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongoClient.close();
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

        // connecting to the database
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
        // fetching the squeal with the given id
        const squeal = await collection.findOne({ id: squealId });

        // if the squeal is not found, return 404
        if (squeal === null) {
            res.status(404).json({ message: "squeal not found" });
            return;
        }

        console.log('Number of Replies:', JSON.stringify(squeal.replies_num));

        // if the squeal is found, return its replies
        res.status(200).json(squeal.replies_num);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongoClient.close();
    }
});


/* -------------------------------------------------------------------------- */
/*                            /SQUEALS/:ID/REPLIES/                           */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

//* GET
// ritorna la lista delle replies dello squeal con id = id ricevuto come parametro
// query facoltativa che ritorna le replies da startIndex a endIndex, se non specificati ritorna le prime 10

//TODO Test the function
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
            res.status(400).json({ message: "startIndex must be less than endIndex" });
            return;
        }



        // connecting to the database
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(squealCollection);
        // fetching the squeal with the given id
        const main_squeal = await collection.findOne({ id: squealId });

        // if the squeal is not found, return 404
        if (main_squeal === null) {
            res.status(404).json({ message: "squeal not found" });
            return;
        }

        // only getting the IDs of the wanted replies
        let idsOfSquealRepliesToReturn = squeals.replies.slice(startIndex, endIndex);

        // what we'll return
        let squealReplies = {};

        // fetching the replies
        for(child_squeal_id in idsOfSquealRepliesToReturn){
            child_squeal = collection.findOne({ id: child_squeal_id });

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
        res.status(500).json({ message: error.message });
    } finally {
        await mongoClient.close();
    }
});