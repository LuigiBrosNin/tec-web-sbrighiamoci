global.rootDir = __dirname;
const express = require('express');
let app = express();

const mongo = require("./index.js");
const dbName = "SquealerDB";
const squealCollection = "Squeals";

app.get("/squeals/", async (req, res) => {
    try {
        //let author = req.query.author;
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
})