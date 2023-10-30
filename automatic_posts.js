/* -------------------------------- SETTINGS -------------------------------- */

global.rootDir = __dirname;

const axios = require('axios');
const tough = require('tough-cookie');
const {wrapper} = require('axios-cookiejar-support');
const { CookieJar } = tough;


// Create a new cookie jar to store cookies between requests
const cookieJar = new CookieJar();

// Apply cookie jar support to axios
wrapper(axios);
axios.defaults.jar = cookieJar;
axios.defaults.withCredentials = true;

const {
  dbName,
  squealCollection,
  channelCollection,
  mongoClient,
  automaticPostsCollection
} = require("./const.js");

// connecting to the database
mongoClient.connect();
const database = mongoClient.db(dbName);
const collection_squeals = database.collection(squealCollection);
const collection_channels = database.collection(channelCollection);
const collection_automaticPosts = database.collection(automaticPostsCollection);


/* ------------------------------- FUNCTIONS -------------------------------- */

// needed for posting squeals trough the API
async function putPeriodicalSqueals() {
        // Authenticate and store the session in the cookie jar
        await authenticate();
        // Once authenticated, the session is stored in the cookie jar for subsequent requests
        
        // Make subsequent requests with the established session
        const response = await makeRequest();
}

// Function to authenticate and store the session
async function authenticate() {
    const authData = {
        // Provide authentication data
        username: 'Arturo', //! TEMP
        password: 'baka'
    };

    const authResponse = await axios.post('https://site222326.tw.cs.unibo.it/login', authData);
}

// Function to make the actual request with the established session
async function makeRequest() {
    const requestData = {
        // Provide data for the request
        // For example:
        someParameter: 'some_value'
    };

    const response = await axios.get('https://site222326.tw.cs.unibo.it/user-check', { params: requestData });
    return response;
}

module.exports = {putPeriodicalSqueals};