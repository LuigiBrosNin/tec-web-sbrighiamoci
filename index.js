global.rootDir = __dirname;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const app = express();

const axios = require('axios');
const cheerio = require('cheerio');

const { isAuthorizedOrHigher, canLogIn, isBannedUntil, typeOfProfile, registerNewUser } = require("./backend/loginUtils.js");

const { interval, day_week_reset, day_month_reset } = require("./backend/const.js");

const BASE_SITE = 'https://site222326.tw.cs.unibo.it'
//const BASE_SITE = 'http://localhost'
exports.BASE_SITE = BASE_SITE;

const port = 8000;

app.set('trust proxy', 1); // trust first proxy

//! FOR ALLOWING LOCAL TESTING, REMOVE WHEN DEPLOYING
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

let cors = require('cors');
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
  if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
    res.redirect("/admin");
  }
  else if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.smm)) {
    res.redirect("/smm");
  }
  else if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.user)) {
    res.redirect("/app");
  }
  else {
    res.redirect("/app");
  }

})

app.get("/login", async (req, res) => {
  res.status(200).sendFile(global.rootDir + '/login/login.html');
})

app.post("/login", bodyParser.json(), async (req, res) => {
  if (await canLogIn(req.body.username, req.body.password)) {
    req.session.user = req.body.username;
    res.status(200).send({ message: "https://site222326.tw.cs.unibo.it/" });
  } else {
    let bannedUntil = await isBannedUntil(req.body.username);
    if (bannedUntil != null) {
      res.status(403).send({ banned_until: bannedUntil });
    }
    else {
      res.status(401).send("wrong username or password");
    }
  }
})

app.use("/loginsrc", express.static(path.join(global.rootDir, '/login/')));

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
  res.json({ user: req.session.user });
})

app.use('/app', express.static(path.join(global.rootDir, 'app/dist/')));
app.use('/app/*', express.static(path.join(global.rootDir, 'app/dist/')));
app.use('/smm', express.static(path.join(global.rootDir, 'smm/build/')));
app.use('/smm/*', express.static(path.join(global.rootDir, 'smm/build/')));

app.get("/admin/adminedit/automaticsqueals", async (req, res) => {
  if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
    res.status(200).sendFile(global.rootDir + '/admin/adminManageAutomaticSqueals.html');
  } else {
    res.redirect("/");
  }
})

app.get("/admin/adminedit/:type/:id", async (req, res) => {
  if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
    if (req.params.type === "squeal") {
      res.status(200).sendFile(global.rootDir + '/admin/adminEditSqueal.html');
    }
    else if (req.params.type === "profile") {
      res.status(200).sendFile(global.rootDir + '/admin/adminEditProfile.html');
    }
    else if (req.params.type === "channel") {
      res.status(200).sendFile(global.rootDir + '/admin/adminEditChannel.html');
    }
    else {
      res.status(404).send();
    }
  }
  else {
    res.redirect("/");
  }
})

app.get("/admin/admincreate/:type", async (req, res) => {
  if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
    if (req.params.type === "channel") {
      res.status(200).sendFile(global.rootDir + '/admin/adminCreateChannel.html');
    }
    else {
      res.status(404).send();
    }
  }
  else {
    res.redirect("/");
  }
})

app.get("/admin/adminsearch/:type", async (req, res) => {
  if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
    if (req.params.type === "privatesqueals") {
      res.status(200).sendFile(global.rootDir + '/admin/adminSearchPrivateSqueals.html');
    }
    else {
      res.status(404).send();
    }
  }
  else {
    res.redirect("/");
  }
})

app.get(["/admin/:paths(*)", "/admin"], async (req, res) => {
  if (await isAuthorizedOrHigher(req.session.user, typeOfProfile.admin)) {
    try {
      let url = 'https://site222326.tw.cs.unibo.it/app/';
      if (req.params.paths != null) {
        url = url + req.params.paths;
      }
      console.log(url);
      const response = await axios.get(url); // Fetch the HTML content

      // Load the HTML content into cheerio for easy manipulation
      const $ = cheerio.load(response.data); // naming it $ is a good practice

      $('title').text('Squealer Admin');
      const scriptHead = '<script src="https://site222326.tw.cs.unibo.it/adminsrc/adminHead.js"></script>'
      $('head').prepend(scriptHead);
      const restoreCSS = '<link rel="stylesheet" href="https://site222326.tw.cs.unibo.it/adminsrc/restoreData.css">'
      $('body').append(restoreCSS);
      const adminCSS = '<link rel="stylesheet" href="https://site222326.tw.cs.unibo.it/adminsrc/adminCss.css">'
      $('body').append(adminCSS);

      // Get the modified HTML
      const modifiedHTML = $.html();

      res.status(200).send(modifiedHTML);
    } catch (error) {
      res.status(500).send(error);
    }
  }
  else {
    res.redirect("/");
  }
})
app.use("/adminsrc", express.static(path.join(global.rootDir, '/admin/')));

app.use('/images', express.static(path.join(global.rootDir, 'images/')));
app.use('/icons', express.static(path.join(global.rootDir, 'icons/')));
app.use('/sounds', express.static(path.join(global.rootDir, 'sounds/')));

// Export bootstrap, so the frontend can use it
app.use('/bootstrap/css', express.static(path.join(global.rootDir, 'node_modules/bootstrap/dist/css/bootstrap.css')));
app.use('/bootstrap/js', express.static(path.join(global.rootDir, 'node_modules/bootstrap/dist/js/bootstrap.bundle.js')));

// Publish source code:
const serveIndex = require('serve-index');
app.use('/source', serveIndex(global.rootDir, { 'icons': true, 'view': 'details' }));
app.use('/source', express.static(global.rootDir, {
  setHeaders: function (res, path) {
    if (path.endsWith(".html")) {
      res.setHeader("Content-type", "text/plain");
    }
  }
}));


module.exports = { app };

const { update_quota_all, reset_credits_all } = require("./backend/profiles.js");
require("./backend/squeal.js");
require("./backend/channels.js");
const { putPeriodicalSqueals, putControversialPeriodicalSqueals } = require("./backend/automatic_posts.js");

async function update_profiles() {
  try {
    await update_quota_all();
    await reset_credits_all(0);

    const date = new Date();

    if (date.getDay() == day_week_reset) {
      await reset_credits_all(1);
    }

    if (date.getDate() == day_month_reset) {
      await reset_credits_all(2);
    }

  } catch (e) {
    console.log(e);
  }
}

// periodic functions
setInterval(putPeriodicalSqueals, interval);
setInterval(putControversialPeriodicalSqueals, interval);

const now = new Date();
const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
const timeUntilMidnight = midnight - now;

update_profiles();


setTimeout(() => {
  update_profiles();
  setInterval(update_profiles, 1000*60*60 * 24); // reset every 24 hours
}, timeUntilMidnight);
