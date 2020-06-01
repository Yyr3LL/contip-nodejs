require('dotenv').config()
const jwt = require('jsonwebtoken');
const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
// const cors = require('cors');

const service = require('./contip/views');

const redis_client = redis.createClient();

redis_client.on("error", (err) => {
    console.log(err);
});

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
/*
*
*  PUTTING USER ID AND EXP DATE IN REQUEST
*
* */
const auth = (req, res, next) => {

    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token === null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });

};


app.post(
    '/login',
    async (req, res) => {
        const { username, password } = await req.body;
        const data = await service.logIn({ username, password });

        const response = {
            access: data.access, 
            refresh: data.refresh
        }

        redis_client.set(data.user_id, data.refresh, redis.print);
        res.send(response);
    });


app.get(
    '/me',
    auth,
    async (req, res) => {
        const user = await service.getUserInfo(req.user);
        res.send(user);
    });


app.post(
    '/signup',
    async (req, res) => {
        const { username, email, password, re_password } = await req.body;
        const user = await service.createUser({ username, email, password, re_password });
        res.send(user);
    });


app.post(
    '/refresh',
    async (req, res) => {
        const refreshToken = req.body.token;

        if (refreshToken === null) return res.sendStatus(401);

        let user_id;

        jwt.verify(refreshToken, process.env.REFRESH, (err, user) => {
            if (err) return res.sendStatus(403);
            user_id = user.id;
        })

        redis_client.get(user_id, (error, reply) => {

            if (error) return res.sendStatus(500);
            if (reply === null) return res.sendStatus(403);

            const accessToken = jwt.sign({ id: user_id }, process.env.ACCESS, { expiresIn: '60s' });
            res.send({access: accessToken});
        })
    });


app.delete(
    '/logout',
    async (req, res) => {
        let user_id;
        const refreshToken = req.body.token;

        if (refreshToken === null) return res.sendStatus(401);

        jwt.verify(refreshToken, process.env.REFRESH, (err, user) => {
            if (err) return res.sendStatus(500);
            user_id = user.id;
        })

        redis_client.del(user_id, (err, reply) => {
            if (err) return res.sendStatus(500);
            console.log(reply);
            return res.sendStatus(204);
        });

    });
/*
*
* GENRE ENDPOINTS
*
* */
app.post(
    '/api/v1/app/genre/create',
    async (req, res) => {
        const { name } = await req.body;
        const genre = await service.createGenre({ name });
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
        const id = await req.params.id;
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
        const { title, imdb, tmdb, genres } = await req.body;
        const movie = await service.createMovie({ title, imdb, tmdb, genres });
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
        const id = await req.params.id;
        const movie = await service.getMovie(id);
        res.send(movie);
    });


app.put(
    '/api/v1/app/movie/:id',
    async (req, res) => {
        const id = await req.params.id;
        const body = await req.body;
        const movie = await service.putMovie({ id, body });
        res.send(movie);
    });


app.delete(
    '/api/v1/app/movie/:id',
    async (req, res) => {
        const id = await req.params.id;
        const movie = await service.destroyMovie(id);
        res.send(movie);
    });
/*
*
* RATING ENDPOINTS
*
* */
app.post(
    '/api/v1/app/rating/create',
    async (req, res) => {
        const { value, user_id, movie_id } = await req.body;
        const rating = await service.createRating({ value, user_id, movie_id });
        res.send(rating);
    });


app.get(
    '/api/v1/app/rating/:id',
    async (req, res) => {
        const id = await req.params.id;
        const movie = await service.getRating(id);
        res.send(movie);
    });


app.put(
    '/api/v1/app/rating/:id',
    async (req, res) => {
        const id = await req.params.id;
        const value = await req.body.value;
        const movie = await service.putRating(id, value);
        res.send(movie);
    });


app.delete(
    '/api/v1/app/rating/:id',
    async (req, res) => {
        const id = await req.params.id;
        const rating = await service.destroyRating(id);
        res.send(rating);
    });
/*
*
* USER PROFILE ENDPOINTS
*
* */
app.put(
    '/api/v1/app/preferences',
    async (req, res) => {
        const { user_id, movies } = await req.body;
        const preferences = await service.putPreferences({ user_id, movies });
        res.send(preferences);
    });


app.get(
    '/api/v1/app/preferences',
    async (req, res) => {
        const user_id = await req.body.user_id;
        const preferences = await service.getPreferences(user_id);
        res.send(preferences);
    });


app.put(
    '/api/v1/app/watched',
    async (req, res) => {
        const { user_id, movies } = await req.body;
        const watched_movie = await service.putWatchedMovies({ user_id, movies });
        res.send(watched_movie);
    });


app.get(
    '/api/v1/app/watched',
    async (req, res) => {
        const user_id = await req.body.user_id;
        const watched_movie = await service.getWatchedMovies(user_id);
        res.send(watched_movie);
    });


app.listen(8000, () => {
    console.log('Listening to 8000...')
})

