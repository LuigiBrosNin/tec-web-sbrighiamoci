// database constants
const {
    MongoClient,
    GridFSBucket,
    ObjectId
} = require("mongodb");
const mongouri = `mongodb://site222326:ui9aeG5f@mongo_site222326?writeConcern=majority`;
const mongoClient = new MongoClient(mongouri);

// packages & declarations
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const cors = require('cors');
const multer = require('multer');
const stream = require('stream');
const sharp = require('sharp');


const upload = multer({
    storage: multer.memoryStorage()
});
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

// CHANGABLE CONSTANTS
// interval for periodical posts
const interval = 10000 // 10 seconds
//1000 * 60 * 60; // 1 hour

const CREDIT_LIMITS = [150, 500, 1000];

const CM = 0.25;

module.exports = (
    BASE_SITE,
    CM,
    CREDIT_LIMITS,
    automationsCollection,
    bodyParser,
    channelCollection,
    collection_automations,
    collection_channels,
    collection_profiles,
    collection_squeals,
    cookieParser,
    cors,
    dbName,
    database,
    express,
    GridFSBucket,
    ObjectId,
    interval,
    mongoClient,
    multer,
    path,
    port,
    profileCollection,
    request,
    session,
    sharp,
    squealCollection,
    stream,
    upload
);
