//npm modules
const express = require('express');
const uuid = require('uuid/v4')
const session = require('express-session')
const bodyParser = require('body-parser');
var path = require('path');

const PORT = process.env.PORT || 3000;


// create the server
const app = express();

var parseForm = bodyParser.urlencoded({ extended: false })

// add & configure middleware
app.use(session({
    genid: (req) => {
        console.log('Inside the session middleware')
        console.log(req.sessionID)
        return uuid() // use UUIDs for session IDs
    },
    name: 'SESS_ID',
    secret: '^#$5sX(Hf6KUo!#65^',
    resave: false,
    saveUninitialized: false
}))


app.use((req, res, next) => {
    if (req.session.csrfToken === undefined) {
        req.session.csrfToken = uuid()
    }
    console.log("req.session.csrfToken :" + req.session.csrfToken);
    next();

})


// create the homepage route at '/'
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'index.html'));
})

// In the website, implement an endpoint that accepts 
// HTTP POST requests and respond with the CSRF token.
// The endpoint receives the session cookie and based on the session identifier,
// return the CSRF token value.
app.post('/middleware', parseForm, function (req, res) {
    console.log(req)
    var token = req.session.csrfToken;
    console.log('middleware().token : ' + token);
    res.json({ csrfToken: token });

})

app.post('/login', parseForm, function (req, res, next) {

    if (req.session.csrfToken !== req.body._csrf) {
        console.log('Invalid CSRF Token!');
        let err = new Error('Invalid CSRF Token!')
        err.status = 403

        return next(err)
    }
    console.log(req)
    res.send(`<h1>SUCCESSFULLY LOGGED IN</h1> <p>USER: ${req.body.email}</p>`)
})

// tell the server what port to listen on
app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
})