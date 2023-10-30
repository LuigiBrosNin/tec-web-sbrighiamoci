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

const authData = {
    // Provide authentication data
    username: "Arturo", //! TEMP
    password: "baka"
};

/* ------------------------------- FUNCTIONS -------------------------------- */

// needed for posting squeals trough the API
async function putPeriodicalSqueals() {
        // Authenticate and store the session in the cookie jar
        await axios.post('https://site222326.tw.cs.unibo.it/login', authData);
        // Once authenticated, the session is stored in the cookie jar for subsequent requests
        
        // Make subsequent requests with the established session
        await mongoClient.connect();
        const posts = await collection_automaticPosts.find({}).toArray();

        for (post of posts) {
            makeRequest(post);
        }
        console.log("Periodical squeals posted");
}

// Function to make the actual request with the established session
async function makeRequest(post) {
    console.log("Making request for post: " + post.uri + "");

    let text = "";
    // get the data from the post
    const response = await axios.get(post.uri);
    
    // get the fields we want from the response
    for(field of post.json_fields) {
        text = text + " " + response.data[field];
    }

    let media = null;
    
    // if the post has a media field, get it
    if (post.media_field != null && post.media_field != "") {
        media = response.data[post.media_field];
    }

    // create the squeal
    const squealData = {
        author: authData.username,
        text: text,
        media: media,
        receiver: post.channel_to_post
    };

    // send and log the squeal
    console.log("sending: " + JSON.stringify(squealData));

    const postResponse = await axios.put('https://site222326.tw.cs.unibo.it/squeals', JSON.stringify(squealData));
    console.log("response; " + JSON.stringify(postResponse.data));
}

module.exports = {putPeriodicalSqueals};