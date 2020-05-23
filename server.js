const express = require('express');
const bodyParser = require('body-parser');

const service = require('./services/service');


const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));


app.post(
    '/me',
    async (req, res) => {
        const {id} = await req.body;
        const user = await service.getUserById({id});
        res.send(user);
    });

app.post(
    '/signup',
    async (req, res) => {
        const {username, email, password, re_password} = await req.body;
        const user = await service.createUser({username, email, password, re_password});
        res.send(user);
    });
/*
*
* GENRE ENDPOINTS
*
* */
app.post(
    '/api/v1/app/genre/create',
    async (req, res) => {
        const {name} = await req.body;
        const genre = await service.createGenre({name});
        res.send(genre);
    });

app.get(
    '/api/v1/app/genre',
    async (req, res) => {
        const genres = await service.listGenre();
        res.send(genres);
    });

app.get(
    '/api/v1/app/genre/:id',
    async (req, res) => {
        const id = req.params.id;
        const genre = await service.getGenre(id);
        res.send(genre);
    });


app.listen(8000, ()=> {
    console.log('Listening to 8000...')
})

