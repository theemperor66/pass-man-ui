const express = require("express");
const dotenv = require("dotenv");
const pg= require("pg");
const bodyParser = require("body-parser");
const session = require("express-session");

const bcrypt = require('bcrypt');
const saltRounds = 10;

const axios = require("axios");
const path = require("path");
const url = "http://127.0.0.1:80"
require('whatwg-fetch');


/* Reading global variables from config file */
dotenv.config();

const PORT = process.env.PORT;

app = express();

const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

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
    const data = {
        userID: 2
    };

    axios.post(url + "/getPasswordEntries", data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });

    res.redirect("/dashboard");
});

app.get("/entry/:id", function(req, res) {
    const data = {
        domain: req.body.domainField,
        annot: req.body.annotField,
        passwordEncrypted: req.body.passwordField,
        //username:
    };

    axios.post(url + "/", data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });

    res.render("entry");
});

app.post("/updateEntry/:id", function(req, res) {


    res.render("entry");
});

app.post("/addEntry", urlencodedParser, function (req, res) {
    const data = {
        domain: req.body.domainField,
        annot: req.body.annotField,
        passwordEncrypted: req.body.passwordField,
        username: req.body.usernameField
    };

    axios.post(url + "/deletePasswordEntry", data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });

    res.redirect("/dashboard");
});

app.post("/deleteEntry/:id", urlencodedParser, function (req, res) {
    let entryId=req.params.id;
    const data = {id: entryId};

    axios.post(url + "/deletePasswordEntry", data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
    res.redirect("/dashboard");
});

app.post("/login", urlencodedParser, function (req, res) {
    const data = {
        username: req.body.usernameField,
        passwordHash: req.body.passwordField
    };

    axios.post(url + "/login", data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });



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
        const data = {
            username: username,
            email: email,
            passwordHash: passwordHash
        };
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
