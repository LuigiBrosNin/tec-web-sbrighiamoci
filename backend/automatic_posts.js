/* -------------------------------- SETTINGS -------------------------------- */
const axios = require('axios');
const tough = require('tough-cookie');
const bodyParser = require('body-parser');
const {wrapper} = require('axios-cookiejar-support');
const { CookieJar } = tough;


// Create a new cookie jar to store cookies between requests
const cookieJar = new CookieJar();

// Apply cookie jar support to axios
wrapper(axios);
axios.defaults.jar = cookieJar;
axios.defaults.withCredentials = true;

const {
    app
} = require("../index.js");
const {
    typeOfProfile,
    isAuthorizedOrHigher
} = require("./loginUtils.js");
const {
    mongoClient,
    collection_automations
} = require("./const.js");

const authData = {
    // Provide authentication data
    username: "SquealerTechnician", //! TEMP
    password: "tecpw"
};

/* ------------------------------- FUNCTIONS -------------------------------- */

// needed for posting squeals trough the API
async function putPeriodicalSqueals() {
        // Authenticate and store the session in the cookie jar
        await axios.post('https://site222326.tw.cs.unibo.it/login', authData);
        // Once authenticated, the session is stored in the cookie jar for subsequent requests
        
        // Make subsequent requests with the established session
        await mongoClient.connect();
        const posts = await collection_automations.find({}).toArray();

        for (post of posts) {
            await makeRequest(post);
        }
        console.log("Periodical squeals posted");
}

// Function to make the actual request with the established session
async function makeRequest(post) {
    try {
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
            receiver: post.channel
        };
    
        // send and log the squeal
        console.log("sending: " + JSON.stringify(squealData));
    
        const postResponse = await axios.put('https://site222326.tw.cs.unibo.it/squeals', squealData);
        console.log("response");
    }
    catch (e) {
        console.log(e);
    }
}

/* -------------------------------------------------------------------------- */
/*                               /AUTOMATICPOSTS/                             */
/*                               GET, PUT, DELETE                             */
/* -------------------------------------------------------------------------- */

//* GET
// get all the automatic posts
app.get('/automaticposts', async (req, res) => {
    try {
        await mongoClient.connect();
        const automaticPosts = await collection_automations.find({}).toArray();
        res.send(automaticPosts);
    }
    catch (e) {
        res.status(500).send(e);
    }
})

//* PUT
// add a new automatic post
// body params: uri, json_fields, media_field, channel
app.put('/automaticposts', bodyParser.json(), async (req, res) => {
    try {

        const authorized = true; // TODO ADD AUTHORIZATION

        if (!authorized) {
            res.status(401).send("Unauthorized");
            return;
        }

        const possibleParams = ["uri", "json_fields", "media_field", "channel"];

        let toInsert = {};

        // check if the body has all the required params
        for (param of possibleParams) {
            if (req.body[param] == null || req.body[param] == "" || (typeof req.body[field] != "string")) {
                res.status(400).send("Missing/Invalid parameter: " + param);
                return;
            } else {
                toInsert[param] = req.body[param];
            }
        }

        await mongoClient.connect();
        const automaticPost = await collection_automations.insertOne(toInsert);
        res.send(automaticPost);
    }
    catch (e) {
        res.status(500).send(e);
    }
})

//* DELETE
// delete an automatic post
// body params: uri
app.delete('/automaticposts', bodyParser.json(), async (req, res) => {
    try {

        const authorized = true; // TODO ADD AUTHORIZATION

        if (!authorized) {
            res.status(401).send("Unauthorized");
            return;
        }

        const uri = req.body.uri;
        // check if the body has all the required params
        if (uri == null || uri == "" || (typeof uri != "string")) {
            res.status(400).send("Missing/Invalid parameter: uri");
            return;
        }

        await mongoClient.connect();
        const post = await collection_automations.findOne({uri: uri});

        if(post == null) {
            res.status(404).send("Automatic post not found");
            return;
        }

        const automaticPost = await collection_automations.deleteOne(toDelete);
        res.send(automaticPost);
    }
    catch (e) {
        res.status(500).send(e);
    }
})


//module.exports = {putPeriodicalSqueals};