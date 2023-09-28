global.rootDir = __dirname;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
//const serveIndex = require('serve-index')
const app = express();
 
const BASE_SITE = 'https://site222326.tw.cs.unibo.it'
//const BASE_SITE = 'http://localhost'
exports.BASE_SITE = BASE_SITE;
 
const port = 8000;
 
app.set('trust proxy', 1); // trust first proxy

 
let cors = require('cors');
app.use(cors({
    origin: BASE_SITE,
    credentials: true,
}));
 
// used for login
app.use(session({
    secret: "secretString", // TODO: change this periodically (like every 6 hours)
    resave: false, 
    saveUninitialized: false
}));
 
app.use(express.static(global.rootDir));
app.use(express.json());
app.use(express.urlencoded({extended: true}));



app.listen(port, function(){
	console.log("Listen ongoing!");
})



let username = "admin";
let password = "qwerty";

//html files indexing
app.get("/", async (req, res) => {
  console.log(req.session.user);
  if(req.session.user == username){
    res.status(200).sendFile(global.rootDir + '/hello.html');
  }
  else {
    res.redirect("/login");
  }

})

app.get("/login", async (req, res) => {
  res.status(200).sendFile(global.rootDir + '/login.html');
})

app.post("/login", bodyParser.json(), async (req, res) => {
  if(req.body.username == username && req.body.password == password){
    req.session.user = username;
    res.send("");
  } else {
    res.send("wrong username or password");
    console.log("wrong username or password");
  }
})

app.get("/logout", async (req, res) => {
  req.session.destroy();
  res.redirect("/");
})



app.use('/app', express.static(path.join(global.rootDir, 'app/dist/')));
app.use('/smm', express.static(path.join(global.rootDir, 'smm/build/')));
app.use('/images', express.static('/images/', {
    index: false,
    setHeaders: function (res, path) {
        res.set("Content-type", "image");
    },
}));

/* SEZIONE MONGODB ALEX */

const { MongoClient } = require("mongodb");
const mongouri = `mongodb://site222326:ui9aeG5f@mongo_site222326?writeConcern=majority`;
const mongoClient = new MongoClient(mongouri);

/* FINE SEZIONE MONGODB ALEX */

// ci serve per pubblicare i nostri sorgenti
// potremmo fare anche a mano
/*
app.use('/source', express.static('/webapp/tec-web-sbrighiamoci/source', {
    index: false,
    setHeaders: function (res, path) {
        if (path.endsWith(".html") || path.endsWith(".js") || path.endsWith(".ts") || path.endsWith(".vue") || path.endsWith(".css") || path.endsWith(".txt")) {
            res.set("Content-type", "text/plain; charset=UTF-8");
        }
    },
}), serveIndex('/webapp/tec-web-sbrighiamoci/source', { 'icons': true }));
 */

module.exports = { app, mongoClient};

require("./squeal.js");