const express = require("express");
const dotenv = require("dotenv");
const pg= require("pg");
const bodyParser = require("body-parser");
const session = require("express-session");

const bcrypt = require('bcrypt');
const saltRounds = 10;

const axios = require("axios");
const path = require("path");
const url = "http://127.0.0.1:80";
require('whatwg-fetch');


const tough = require('tough-cookie');
const { promisify } = require('util');


const passmanLibrary=require('./passmanLibrary');

/* Reading global variables from config file */
dotenv.config();

const PORT = process.env.PORT;

app = express();

const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

const cookieJar = new tough.CookieJar();


app.use(session({
    secret: "Das ist geheim!",
    resave: true,
    saveUninitialized: true
}));

//utility
function generatePassword(length, uppercase, digits, symbols, excludeSimilar, excludeChars) {
    let chars = [];
    if (uppercase > 0) chars.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    chars.push(...'abcdefghijklmnopqrstuvwxyz');
    if (digits > 0) chars.push(...'0123456789');
    if (symbols > 0) chars.push(...'_-@#$%&');

    if (excludeSimilar) {
        chars = chars.filter((char) => !['I', 'l', '1', 'O', '0'].includes(char));
    }

    chars = chars.filter((char) => !excludeChars.includes(char));

    let password = "";
    for (let i = 0; i < length; i++) {
        let char;
        do {
            char = chars[Math.floor(Math.random() * chars.length)];
        } while (
            uppercase > 0 && char === char.toUpperCase() && password.match(/[A-Z]/g).length >= uppercase ||
            digits > 0 && !isNaN(parseInt(char)) && password.match(/[0-9]/g).length >= digits ||
            symbols > 0 && ['_', '-', '@', '#', '$', '%', '&'].includes(char) && password.match(/[_\-@#$%&]/g).length >= symbols
            );
        password += char;
    }
    return password;
}

//turn on serving static files (required for delivering css to client)
app.use(express.static("public"));
app.use(express.static("images"));
//configure template engine
app.set("views", "views");
app.set("view engine", "pug");

app.get('/', function (req, res) {
    if(req.session.user===undefined) {
        res.render("startpage");
    }
});

app.get('/startpage', function (req, res) {
    res.redirect("/");
});

app.get("/dashboard", function (req, res) {
    passmanLibrary.getPasswordEntries().then(r => {

    })

    res.redirect("/dashboard");
});

app.get("/entry/:eId", function(req, res) {
    const id = req.params.id;
    let passwordEntry;
    passmanLibrary.getPasswordById(id).then(r => {
        passwordEntry = r.data.map(entry => {
            return {
                id: r.id,
                username: r.username,
                password: r.passwordEncrypted,
                urls: r.domain,
                annot: r.annot
            }
        })
    });

    res.render("entry", {
        entryData: passwordEntry
    });
});

app.post("/updateEntry/:id", function(req, res) {


    res.render("entry");
});

app.post("/addEntry", urlencodedParser, function (req, res) {
    const domain = req.body.domainField;
    const annot = req.body.annotField;
    const passwordEncrypted = req.body.passwordField;
    const username = req.body.usernameField;

    passmanLibrary.addPasswordEntry(domain, username, passwordEncrypted, annot);

    res.redirect("/dashboard");
});

app.post("/deleteEntry/:id", urlencodedParser, function (req, res) {
    let entryId=req.params.id;

    passmanLibrary.deletePasswordEntry(id);

    res.redirect("/dashboard");
});

app.post("/login", urlencodedParser, function (req, res) {
    let username = req.body.usernameField;
    let passwordHash = req.body.passwordField;

    passmanLibrary.login(username, passwordHash).then(r => {
        console.log(r.data.userId);
        req.session.user = {
            userId: r.data.userId
        }
        req.session.cookie = {
            expires: r.data.expireTimestamp
        }
    });

    console.log(req.session.user);
    console.log(req.session.cookie.expires);

    res.redirect("/startpage");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", urlencodedParser, function (req, res) {
    let username = req.body.usernameField;
    let email = req.body.emailField;
    let passwordHash = req.body.passwordField;
    let confirmPasswordHash = req.body.passwordConfirmationField;

    if(passwordHash!==confirmPasswordHash) {
        res.render("error", {
            error: "Passwords do not match!"
        })
    }
    else {
        passmanLibrary.register(username, email, passwordHash).then(r => {
            const uId = r.data.userId
            req.session.user = {
                userId: uId
            }
            req.session.cookie = {
                expires: r.data.expireTimestamp
            }
        });

        res.redirect("/dashboard");
    }
});

app.get("/passwordGenerator", function (req, res) {
    res.render("passwordgenerator");
});

app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        console.log("Session destroyed!")
    });
    res.redirect("/");
});

app.listen(PORT, function() {
  console.log(`PassMan running and listening on port ${PORT}`);
});