const User = require('../models').User;
const Movie = require('../models').Movie;
const Genre = require('../models').Genre;
const UserPreference = require('../models').UserPreference;
const UserWatchedMovie = require('../models').UserWatchedMovie;

const check_existing_data = require('../service').check_existing_data;


const putPreferences = async (req, res) => {
    const genres = await req.body.genres;
    const user_id = await req.user.id;

    try {

        let list = [
            await check_existing_data(User, user_id),
        ]

        for (let genre_id of genres) {
            list.push(await check_existing_data(Genre, genre_id))
        }

        if (list.includes(false)) {
            return { msg: "Incorrect data" };
        }

        await UserPreference.destroy({
            where: {
                user_id: user_id
            }
        });

        for (let genre_id of genres) {
            await UserPreference.create({ user_id, genre_id });
        }

        res.send(genres);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
}


const putWatchedMovies = async (req, res) => {
    const movies = await req.body.movies;
    const user_id = await req.user.id;
    try {

        let list = [
            await check_existing_data(User, user_id),
        ]

        for (let movie_id of movies) {
            list.push(await check_existing_data(Movie, movie_id))
        }

        if (list.includes(false)) {
            return { msg: "Incorrect data" };
        }

        await UserWatchedMovie.destroy({
            where: {
                user_id: user_id
            }
        });

        for (let movie_id of movies) {
            await UserWatchedMovie.create({ user_id, movie_id });
        }

        res.send(movies);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
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
        return { msg: "Something went wrong" };
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
            return item['dataValues']['movie_id'];
        })

        console.log(movies);

        res.send(movies);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
}


module.exports = {
    putPreferences,
    getPreferences,
    putWatchedMovies,
    getWatchedMovies
}