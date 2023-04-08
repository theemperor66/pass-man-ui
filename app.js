const express = require("express");
const dotenv = require("dotenv");
const pg= require("pg");
const bodyParser = require("body-parser");
let session=""

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

//turn on serving static files (required for delivering css to client)
app.use(express.static("public"));
app.use(express.static("images"));
//configure template engine
app.set("views", "views");
app.set("view engine", "pug");

app.get('/', function (req, res) {
    res.render("startpage");
});

app.get('/startpage', function (req, res) {
    res.redirect("/");
});

app.get("/dashboard", function (req, res) {
    let entries = [];
    passmanLibrary.getPasswordEntries(session).then(r => {
        console.log(r);

        for(let i= 0; i<r.data.length; i++) {
            entries[i] = r.data.map(entry => {
                return {
                    id: entry.id,
                    username: entry.username,
                    password: entry.passwordEncrypted,
                    urls: entry.domain,
                    annot: entry.annot
                }
            })
        }
    })

    res.render("dashboard", {
        entries: entries
    });
});

app.get("/entry/:eId", function(req, res) {
    const id = req.params.id;
    let passwordEntry;
    passmanLibrary.getPasswordById(id, session).then(r => {
        passwordEntry = r.data.map(entry => {
            return {
                id: entry.id,
                username: entry.username,
                password: entry.passwordEncrypted,
                urls: entry.domain,
                annot: entry.annot
            }
        })
    });

    res.render("entry", {
        entryData: passwordEntry
    });
});

app.post("/updateEntry/:id", function(req, res) {


    res.redirect("/dashboard");
});

app.post("/addEntry", urlencodedParser, function (req, res) {
    const domain = req.body.domainField;
    const annot = req.body.annotField;
    const passwordEncrypted = req.body.passwordField;
    const username = req.body.usernameField;

    passmanLibrary.addPasswordEntry(domain, username, passwordEncrypted, annot, session);

    res.redirect("/dashboard");
});

app.post("/deleteEntry/:id", urlencodedParser, function (req, res) {
    let entryId=req.params.id;

    passmanLibrary.deletePasswordEntry(id, session);

    res.redirect("/dashboard");
});

app.post("/login", urlencodedParser, function (req, res) {
    let username = req.body.usernameField;
    let passwordHash = req.body.passwordField;

    // login and set session
    passmanLibrary.login(username, passwordHash).then(r => {
        session=r});

    res.redirect("/dashboard");

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
        passmanLibrary.register(username, email, passwordHash);

        passmanLibrary.login(username, passwordHash);

        res.redirect("/dashboard");
    }
});

app.get("/passwordGenerator", function (req, res) {
    res.render("passwordgenerator");
});

app.get("/logout", function (req, res) {
    passmanLibrary.logout();

    session = "";

    res.redirect("/");
});

app.listen(PORT, function() {
  console.log(`PassMan running and listening on port ${PORT}`);
});