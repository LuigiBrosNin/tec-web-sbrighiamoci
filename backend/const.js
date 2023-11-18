// database constants
/* SEZIONE MONGODB ALEX */
const {
    MongoClient,
    GridFSBucket
} = require("mongodb");
const mongouri = `mongodb://site222326:ui9aeG5f@mongo_site222326?writeConcern=majority`;
const mongoClient = new MongoClient(mongouri);
/* FINE SEZIONE MONGODB ALEX */

const stream = require('stream');

const dbName = "SquealerDB";
const squealCollection = "Squeals";
const profileCollection = "Profiles";
const channelCollection = "Channels";
const automationsCollection = "Automations";

mongoClient.connect();
const database = mongoClient.db(dbName);
const collection_squeals = database.collection(squealCollection);
const collection_profiles = database.collection(profileCollection);
const collection_channels = database.collection(channelCollection);

// interval for periodical posts
const interval = 10000 // 10 seconds
//1000 * 60 * 60; // 1 hour

const CREDIT_LIMITS = [150, 500, 1000];

const CM = 0.25;

// Functions for import/export pics into the db

// returns true if the import is successful, false otherwise
async function importPic(pic, collection, name) {
    try {
        mongoClient.connect();
        const bucket = new GridFSBucket(database);
        const buffer = pic.buffer;
        const readableStream = new stream.PassThrough();
        readableStream.end(buffer);

        const uploadStream = bucket.openUploadStream(pic.originalname, {
            metadata: {
                originalname: pic.originalname,
            }
        });

        console.log("uploadStream.id: " + uploadStream.id);
        uploadStream.on('error', (error) => {
            res.status(500).json({
                message: error.message
            });
            console.log("media problem: " + error.message);
            return false;
        });

        console.log("collection from const: " + collection);

        uploadStream.on('finish', () => {
            if (collection.collectionName === collection_squeals.collectionName) {
                // Update the squeal with the ID of the uploaded file
                collection.updateOne({
                    id: name
                }, {
                    $set: {
                        media: uploadStream.id
                    }
                });
            } else {
                collection.updateOne({
                    name: name
                }, {
                    $set: {
                        propic: uploadStream.id
                    }
                });
            }
        });
        readableStream.pipe(uploadStream);
        return true;
    } catch (e) {
        console.log(e);
    }
}

async function exportPic(pic, res) {
    try {
        const bucket = new GridFSBucket(database);
        const downloadStream = bucket.openDownloadStream(pic);
        
        downloadStream.on('data', (chunk) => {
            res.write(chunk);
        }
        );
        downloadStream.on('error', () => {
            res.sendStatus(404);
        }
        );
        downloadStream.on('end', () => {
            res.end();
        }
        );

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    dbName,
    squealCollection,
    profileCollection,
    channelCollection,
    automationsCollection,
    mongoClient,
    interval,
    CREDIT_LIMITS,
    CM,
    importPic,
    exportPic
};