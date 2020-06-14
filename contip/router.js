require('dotenv').config()
const jwt = require('jsonwebtoken');
const express = require('express');
const redis = require('redis');
const router = express.Router();
const views = require('require-all')(__dirname + '/views');


const redis_client = redis.createClient();

redis_client.on("error", (err) => {
    console.log(err);
});


// PUTTING USER ID AND EXP DATE IN REQUEST

const JWTAuth = (req, res, next) => {

    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });

};


router.post(
    '/login',
    views.auth.logIn
);


router.get(
    '/me',
    JWTAuth,
    views.auth.getUserInfo
);


router.post(
    '/signup',
    views.auth.createUser
    );


router.post(
    '/refresh',
    views.auth.refreshToken
);


router.delete(
    '/logout',
    views.auth.logOut
);
/*
*
* GENRE ENDPOINTS
*
* */
router.post(
    '/genre/create',
    JWTAuth,
    views.genre.createGenre
);


router.get(
    '/genre',
    JWTAuth,
    views.genre.listGenre
);


router.get(
    '/genre/:id',
    JWTAuth,
    views.genre.getGenre
);
/*
*
* MOVIE ENDPOINTS
*
* */
router.post(
    '/movie/create',
    JWTAuth,
    views.movie.createMovie
);


router.get(
    '/movie',
    JWTAuth,
    views.movie.listMovie
);


router.get(
    '/movie/:id',
    JWTAuth,
    views.movie.getMovie
);


router.put(
    '/movie/:id',
    JWTAuth,
    views.movie.putMovie
);


router.delete(
    '/movie/:id',
    JWTAuth,
    views.movie.destroyMovie
);
/*
*
* RATING ENDPOINTS
*
* */
router.post(
    '/rating/create',
    JWTAuth,
    views.rating.createRating
);


router.get(
    '/rating/:id',
    JWTAuth,
    views.rating.getRating
);


router.put(
    '/rating/:id',
    JWTAuth,
    views.rating.putRating
);


router.delete(
    '/rating/:id',
    JWTAuth,
    views.rating.destroyRating
);
/*
*
* USER PROFILE ENDPOINTS
*
* */
router.put(
    '/preferences',
    JWTAuth,
    views.user_profile.putPreferences
);


router.get(
    '/preferences',
    JWTAuth,
    views.user_profile.getPreferences
);


router.put(
    '/watched',
    JWTAuth,
    views.user_profile.putWatchedMovies
);


router.get(
    '/watched',
    JWTAuth,
    views.user_profile.getWatchedMovies
);


module.exports = router;
