global.rootDir = __dirname;

const {app, mongo} = require("./index.js");
const dbName = "SquealerDB";
const squealCollection = "Squeals";

app.get("/squeals/", async (req, res) => {
    try {
        let author = req.query.author;
        let startIndex = parseInt(req.query.startindex);
        let endIndex = parseInt(req.query.endindex);
        if(!author || !startIndex || !endIndex){
            res.status(400).json({ message: "author, startindex and endindex are required" });
            return;
        }

        await mongo.connect();
        const database = mongo.db(dbName);
        const collection = database.collection(squealCollection);
        const squeals = await collection.find({ author }) // returns the squeals made by author
                                        .sort({ timestamp: -1 }) // ordered inverse chronological order
                                        .skip(startIndex) // starting from startIndex
                                        .limit(endIndex); // returns endIndex squeals
        res.status(200).json(squeals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await mongo.close();
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