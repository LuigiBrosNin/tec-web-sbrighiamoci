const express = require('express');
const path = require('path');
const session = require('express-session');
const serveIndex = require('serve-index')
const app = express();
 
const BASE_SITE = 'https://site222326.tw.cs.unibo.it'
exports.BASE_SITE = BASE_SITE;
 
const port = 8000;
 
app.set('trust proxy', 1); // trust first proxy
 
let cors = require('cors');
app.use(cors({
    origin: BASE_SITE,
    credentials: true,
}));
 
// used for login, has to be changed accordingly with how we handle them
// app.use(session({secret: 'n4t"7y4t7?874!f0t78nqc94nrut7483_t', resave: false, saveUninitialized: true}));
 
app.use(express.json());
app.use(express.urlencoded({extended: true}));
 
app.use('/app', express.static(path.join(__dirname, 'app/dist/')));
app.use('/smm', express.static(path.join(__dirname, 'smm/build/')));
app.use('/images', express.static('/webapp/images/', {
    index: false,
    setHeaders: function (res, path) {
        res.set("Content-type", "image");
    },
}));
 

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