// database constants
/* SEZIONE MONGODB ALEX */
const {
    MongoClient,
    GridFSBucket,
    ObjectId
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
const collection_automations = database.collection(automationsCollection);

// interval for periodical posts
const interval = 1000 * 60 * 60 * 8; // 8 hours, normally would be 1 hour, but for presentational purposes we set it to 8

// interval for quota calcs
const quota_interval =30*24*60*60*1000 // 30 days

const quota_threshold = 10  // cannot be 0!!

const day_week_reset = 0;

const day_month_reset = 1;

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

        uploadStream.on('finish', () => {
            if (collection.collectionName === collection_squeals.collectionName) {
                // Update the squeal with the ID of the uploaded file
                collection.updateOne({
                    id: name
                }, {
                    $set: {
                        media: `site222326.tw.cs.unibo.it/squeals/${name}/media`,
                        media_id: uploadStream.id
                    }
                });
            } else {
                collection.updateOne({
                    name: name
                }, {
                    $set: {
                        propic: `site222326.tw.cs.unibo.it/${collection.collectionName.toLowerCase()}/${name}/propic`,
                        media_id: uploadStream.id
                    }
                });
            }
        });
        readableStream.pipe(uploadStream);
        return true;
    } catch (e) {
        console.log(e);
        return false;
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

async function deletePic(fileId) {
    try {
        mongoClient.connect();
        const bucket = new GridFSBucket(database);
        const objectId = new ObjectId(fileId); // Convert string to ObjectId

        bucket.delete(objectId, (error) => {
            if (error) {
                console.error('Error deleting file: ', error);
                return false;
            }

            console.log('File deleted successfully');
            return true;
        });
    } catch (error) {
        console.error('Error: ', error);
        return false;
    }
}

module.exports = {
    dbName,
    squealCollection,
    profileCollection,
    channelCollection,
    automationsCollection,
    collection_automations,
    collection_channels,
    collection_profiles,
    collection_squeals,
    mongoClient,
    interval,
    quota_interval,
    quota_threshold,
    CREDIT_LIMITS,
    CM,
    day_week_reset,
    day_month_reset,
    importPic,
    exportPic,
    deletePic,
};