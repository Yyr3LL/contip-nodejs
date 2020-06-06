require('dotenv').config()
const jwt = require('jsonwebtoken');
const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');

const api = require('./contip/router');


const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();

    app.options('*', (req, res) => {
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });
});

app.use('/api/v1/app', api);

app.listen(8000, () => {
    console.log('Listening to 8000...')
})

module.exports = app;
