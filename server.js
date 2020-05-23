const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

const service = require('./services/service');


const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();

    app.options('*', (req, res) => {
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });
});


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
/*
*
* MOVIE ENDPOINTS
*
* */
app.post(
    '/api/v1/app/movie/create',
    async (req, res) => {
        const {title, imdb, tmdb, genres} = await req.body;
        const movie = await service.createMovie({title, imdb, tmdb, genres});
        res.send(movie);
    });


app.get(
    '/api/v1/app/movie',
    async (req, res) => {
        const movies = await service.listMovie();
        res.send(movies);
    });


app.get(
    '/api/v1/app/movie/:id',
    async (req, res) => {
        const id = req.params.id;
        const movie = await service.getMovie(id);
        res.send(movie);
    });


app.put(
    '/api/v1/app/movie/:id',
    async (req, res) => {
        const id = req.params.id;
        const body = req.body;
        const movie = await service.putMovie({id, body});
        res.send(movie);
    });

app.delete(
    '/api/v1/app/movie/:id',
    async (req, res) => {
        const id = req.params.id;
        const movie = await service.destroyMovie(id);
        res.send(movie);
    });


app.listen(8000, ()=> {
    console.log('Listening to 8000...')
})

