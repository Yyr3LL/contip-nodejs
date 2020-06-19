const {User} = require('../models');
const {Genre} = require('../models');
const {Movie} = require('../models');
const {UserPreference} = require('../models');
const {UserWatchedMovie} = require('../models');

const check_existing_data = require('../service').check_existing_data;
const {check_all_data} = require('../service');


const putPreferences = async (req, res) => {
    const genres = await req.body.genres;
    const user_id = await req.user.id;

    try {

        let list = [
            await check_existing_data(User, user_id),
        ]

        if (!await check_all_data(Genre, genres)) {
            return res.status(400).send({
                msg: 'Incorrect data'
            });
        }

        await UserPreference.destroy({
            where: {
                user_id: user_id
            }
        });

        for (let genre_id of genres) {
            await UserPreference.create({user_id, genre_id});
        }

        res.send(genres);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({
            msg: 'Something went wrong',
            err: `${err.name}`
        });
    }
}


const putWatchedMovies = async (req, res) => {
    let movies;
    let user_id;

    const body = await req.body;

    if (!body.hasOwnProperty('movies')) {
        return res.status(400).send({
            msg: 'You haven\'t any provided data'
        })
    }

    movies = body.movies;
    user_id = await req.user.id;

    try {

        let list = [
            await check_existing_data(User, user_id),
        ]

        for (let movie of movies) {
            list.push(await check_existing_data(Movie, movie.movie_id))
        }

        if (list.includes(false)) {
            return res.status(400).send({msg: "Incorrect data"});
        }

        await UserWatchedMovie.destroy({
            where: {
                user_id: user_id
            }
        });

        let result_movies = [];

        for (const movie of movies) {

            let watched_movie = {
                user_id: user_id,
                movie_id: movie.movie_id
            }

            if (movie.hasOwnProperty('value')) {
                watched_movie.value = movie.value;
            } else {
                watched_movie.value = null;
            }

            result_movies.push(
                await UserWatchedMovie.create(watched_movie)
            );

        }

        return res.send(result_movies);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({
            msg: 'Something went wrong',
            err: `${err.name}`
        });
    }
}


const getPreferences = async (req, res) => {
    const user_id = await req.user.id;
    try {

        const preferences = await UserPreference.findAll({
            where: {
                user_id: user_id
            }
        });

        let genres = preferences.map(item => {
            return item['dataValues']['genre_id'];
        })

        console.log(genres);

        res.send(genres);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({
            msg: 'Something went wrong',
            err: `${err.name}`
        });
    }
}


const getWatchedMovies = async (req, res) => {
    const user_id = await req.user.id;
    try {

        const watched_movies = await UserWatchedMovie.findAll({
            where: {
                user_id: user_id
            }
        });

        let movies = watched_movies.map(item => {
            return {
                movie_id: item['dataValues']['movie_id'],
                value: item['dataValues']['value']
            }
        })

        return res.send(movies);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({
            msg: 'Something went wrong',
            err: `${err.name}`
        });
    }
}


module.exports = {
    putPreferences,
    getPreferences,
    putWatchedMovies,
    getWatchedMovies
}
