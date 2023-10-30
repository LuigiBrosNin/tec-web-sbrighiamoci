global.rootDir = __dirname;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const app = express();

const { isAuthorizedOrHigher, canLogIn, typeOfProfile, registerNewUser } = require("./backend/loginUtils.js");

//const { interval } = require("./backend/const.js");

const BASE_SITE = 'https://site222326.tw.cs.unibo.it'
//const BASE_SITE = 'http://localhost'
exports.BASE_SITE = BASE_SITE;

const port = 8000;

app.set('trust proxy', 1); // trust first proxy


let cors = require('cors');
const { putPeriodicalSqueals } = require('./backend/automatic_posts.js');
app.use(cors({
  //origin: BASE_SITE,
  credentials: true,
}));

// used for login
app.use(session({
  secret: "secretString", // TODO: change this periodically (like every 6 hours)
  resave: false,
  saveUninitialized: false
}));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, function () {
  console.log("Listen ongoing!");
})

//html files indexing
app.get("/", async (req, res) => {
  console.log(req.session.user);
  if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.user)) {
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
  if (await canLogIn(req.body.username, req.body.password)) {
    req.session.user = req.body.username;
    res.redirect("/");
  } else {
    res.send("wrong username or password");
    console.log("wrong username or password");
  }
})

app.get("/logout", async (req, res) => {
  req.session.destroy();
  res.redirect("/");
})

app.put("/signin", async (req, res) => {
  if (req.body.username != null && req.body.username !== "" && req.body.email != null && req.body.email !== "" && req.body.password != null && req.body.password !== "") { // the check var == null is equivalent to var === null && var === undefined
    let status = await registerNewUser(req.body.username, req.body.email, req.body.password);
    res.status(status).send();

  } else {
    res.status(422).send("you need to specify username, email and password to sing in");
  }
})

app.get("/user-check", async (req, res) => {
  console.log("user: " + req.session.user);
  res.send(req.session.user);
})

app.use('/app', express.static(path.join(global.rootDir, 'app/dist/')));
app.use('/smm', express.static(path.join(global.rootDir, 'smm/build/')));
app.use('/images', express.static('/images/', {
  index: false,
  setHeaders: function (res, path) {
    res.set("Content-type", "image");
  },
}));
app.use('/icons', express.static(path.join(global.rootDir, 'icons/')));

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
require("./automatic_posts.js");

//* periodic function, activate when ready
//setInterval(putPeriodicalSqueals, interval);


module.exports = { app };

require("./backend/squeal.js");
require("./backend/profiles.js");
require("./backend/channels.js");