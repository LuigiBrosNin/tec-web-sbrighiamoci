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
    collection_automations,
    collection_channel,
    collection_squeals,
    CM,
    interval
} = require("./const.js");

const authData = {
    // Provide authentication data
    username: "SquealerTechnician",
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

        for (const post of posts) {
            await makeRequest(post);
        }
        console.log("Periodical squeals posted");
}

async function putControversialPeriodicalSqueals() {
    try {
        const channelName = "CONTROVERSIAL";

        // Authenticate and store the session in the cookie jar
        await axios.post('https://site222326.tw.cs.unibo.it/login', authData);
        // Once authenticated, the session is stored in the cookie jar for subsequent requests
        
        // Make subsequent requests with the established session
        await mongoClient.connect();
        const channel = collection_channel.findOne({name: channelName});
    
        if(channel == null) {
            console.log("Channel not found");
            return;
        }
    
        // retrieve all the Controversial squeals posted in the last interval
        // a controversial squeal is a squeal that has a positive and negative
        // polarity ratio greater than the critical mass CM
        const lastHourSqueals = await collection_squeals.find({
            date: { $gte: (Date.now() - interval) },
            $and: [
                { neg_popolarity_ratio: { $gte: CM}},
                { pos_popolarity_ratio: { $gte: CM}}
            ]
        }).toArray();
    
        // sort the squeals by number of impressions
        lastHourSqueals.sort((a, b) => {
            return b.impressions - a.impressions;
        });
    
        // get the squeal with the most impressions
        const squealToPost = lastHourSqueals[0];

        if(squealToPost.secondary_channels == null) {
            squealToPost.secondary_channels = [];
        }

        // add the channel to the squeal
        squealToPost.secondary_channels.push(channelName);

        // update the squeal in the db
        await collection_squeals.updateOne({id: squealToPost.id}, {$set: squealToPost});
    
        // add the squeal to the channel
        fetch('https://site222326.tw.cs.unibo.it/channels/' + channelName + '/squeals_list', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                squeal_id: squealToPost.id
            }
        }).then(res => {
            if (res.status == 200) {
                console.log("Controversial squeal added to channel");
            }
            else {
                console.log("Error adding controversial squeal to channel");
            }
        }).catch(err => {
            console.log("Error adding controversial squeal to channel: " + err);
        });
    }
    catch (e) {
        console.log(e);
    }

}

// Function to make the actual request with the established session
async function makeRequest(post) {
    try {
        console.log("Making request for post: " + post.uri + "");

        // get the data from the post
        const response = await axios.get(post.uri);

        let text = "";

        if(post.json_fields && !post.is_body_media) {
            // get the fields we want from the response
            for(let field of post.json_fields) {
                text = text + " " + response.data[field];
            }
        } else {
            text = " ";
        }

    
        let formData = new FormData();
        
        let media = null;

        if (post.is_body_media) {
            media = response.data;
            formData.append("file", media);
        }

        // if the post has a media field, get it
        if (post.media_field != null && post.media_field != "" && !post.is_body_media) {
            media = response.data[post.media_field];

            if(!media.startsWith("http://") && !media.startsWith("https://")) {
                media = "https://" + media;
            }

            image = await fetch(media);

            if(image.status == 200) {
                image = image.body;
                formData.append("file", image);
            }
            
        }
    
        // create the squeal
        const squealData = {
            author: authData.username,
            text: text,
            receiver: post.channel
        };


        formData.append("json", JSON.stringify(squealData));
    
        // send and log the squeal
        console.log("sending: " + JSON.stringify(squealData));
    
        const postResponse = await axios.put('https://site222326.tw.cs.unibo.it/squeals', formData);
        console.log("response: " + JSON.stringify(postResponse.data));
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

        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);

        if (!adminAuthorized) {
            res.status(401).send("Unauthorized");
            return;
        }

        await mongoClient.connect();
        const automaticPosts = await collection_automations.find({}).toArray();
        res.send(automaticPosts);
    }
    catch (e) {
        res.status(500).send({ message: e.message });
    }
})

//* PUT
// add a new automatic post
// body params: uri, json_fields, media_field, channel
app.put('/automaticposts', bodyParser.json(), async (req, res) => {
    try {

        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);

        if (!adminAuthorized) {
            res.status(401).send("Unauthorized");
            return;
        }


        const possibleParams = ["uri", "json_fields", "media_field", "channel", "is_body_media"];



        let toInsert = {};

        // check if the body has all the required params
        for (let param of possibleParams) {
            if (req.body[param] == null || req.body[param] == "") {
                continue;
            } else {
                toInsert[param] = req.body[param];
            }
        }

        if (!toInsert.uri || !toInsert.channel) {
            res.status(400).send("Missing/Invalid parameter: uri or channel");
            return;
        }

        if(!toInsert.is_body_media && !toInsert.media_field && !toInsert.json_fields) {
            res.status(400).send("At least one of the following parameters must be specified: media_field, json_fields, is_body_media");
            return;
        }

        // transform is_body_media to boolean
        if(toInsert.is_body_media == "true") {
            toInsert.is_body_media = true;
        }
        else if(toInsert.is_body_media == "false") {
            toInsert.is_body_media = false;
        }


        await mongoClient.connect();
        const automaticPost = await collection_automations.insertOne(toInsert);
        res.send(automaticPost);
    }
    catch (e) {
        res.status(500).send({ message: e.message });
    }
})

//* DELETE
// delete an automatic post
// body params: uri
app.delete('/automaticposts', bodyParser.json(), async (req, res) => {
    try {

        const adminAuthorized = await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin);

        if (!adminAuthorized) {
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
        const toDelete = await collection_automations.findOne({uri: uri});

        if(toDelete == null) {
            res.status(404).send("Automatic post not found");
            return;
        }

        const deleted = await collection_automations.deleteOne(toDelete);
        res.send(deleted);
    }
    catch (e) {
        res.status(500).send({ message: e.message });
    }
})


//module.exports = {putPeriodicalSqueals, putControversialPeriodicalSqueals};