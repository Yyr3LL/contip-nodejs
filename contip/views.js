const sequelize = require('sequelize');
const User = require('../models').User;
const Genre = require('../models').Genre;
const Movie = require('../models').Movie;
const Movie_Genre = require('../models').Movie_Genre;
const Rating = require('../models').Rating;
const UserWatchedMovie = require('../models').UserWatchedMovie;
const UserPreference = require('../models').UserPreference;

const check_existing_data = require('./service').check_existing_data;
const get_clear_movie = require('./service').get_clear_movie;


const seq = new sequelize.Sequelize('postgres://yyr3ll:7331@localhost:5432/db');


const createUser = async ({username, email, password, re_password}) => {
    try {

        if (password !== re_password) {
            return {msg: "re_password does not match"};
        }
        return await User.create({username, email, password, re_password});

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


const getUserById = async ({id}) => {
    let user = await seq.query(`SELECT \"id\", \"username\", \"email\", \"createdAt\", \"updatedAt\" FROM \"Users\" AS \"User\" WHERE \"User\".\"id\" = ${id};\n`)
    if (user === null) {
        return {msg: "User not found"};
    }
    delete user.password;
    return user[0][0];
};


const createGenre = async ({name}) => {
    try {

        return await Genre.create({name});

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


const listGenre = async () => {
    try {

        return await Genre.findAll();

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


const getGenre = async (id) => {
    try {

        const genre = await Genre.findByPk(id);
        if (genre === null) {
            return {msg: "Genre with id of " + id + " not found"};
        }
        return genre;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


const createMovie = async ({title, imdb, tmdb, genres}) => {
    try {

        const movie = await Movie.create({title, imdb, tmdb});
        const cur_movie_id = movie.id;
        genres.forEach(genre_id => {
            Movie_Genre.create({movie_id: cur_movie_id, genre_id: genre_id});
        });
        return movie;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
}


const listMovie = async () => {
    try {

        let movies = await Movie.findAll({
            include: Genre
        });

        for (let movie of movies) {
            movie = await get_clear_movie(movie);
        }

        return movies;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: 'Something went wrong'};
    }
}


const getMovie = async (id) => {
    try {

        let movie = await Movie.findOne({
            where: {
                id: id
            },
            include: Genre
        });

        if (movie === null) {
            return {msg: 'Movie not found'};
        }

        return await get_clear_movie(movie);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
}


const putMovie = async ({id, body}) => {
    try {

        let movie = await Movie.findOne({
            where: {
                id: id
            },
            include: Genre
        });

        if (movie === null) {
            return {msg: "Movie not found"};
        }

        movie = await get_clear_movie(movie);

        const fields = ['title', 'imdb', 'tmdb', 'genres'];

        if (fields.map(field => {
            return body.hasOwnProperty(field);
        }).includes(false)) {
            return {msg: "Please provide all the values"};
        }

        for (let field of fields) {
            movie[field] = body[field];
        }

        await Movie_Genre.destroy({where: {movie_id: id}});

        let checking_data = [];

        for (let genre_id of body.genres) {
            checking_data.push(await check_existing_data(Genre, genre_id));
        }

        if (checking_data.includes(false)) {
            return {msg: "Incorrect data"};
        }

        for (let genre_id of body.genres) {
            await Movie_Genre.create({movie_id: id, genre_id: genre_id});
        }

        await Movie.update(body, {where: {id: id}});

        return movie;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
}


const destroyMovie = async (id) => {
    try {

        let movie = await Movie.findByPk(id);

        if (movie === null) {
            return {msg: "Movie not found"};
        }

        // await Movie_Genre.destroy({where: {movie_id: movie.id}});
        await Movie.destroy({where: {id: movie.id}});

        return {msg: `Movie with id: ${movie.id} has been successfully deleted`};

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
}


const createRating = async ({value, movie_id, user_id}) => {
    try {

        let list = [
            await check_existing_data(User, user_id),
            await check_existing_data(Movie, movie_id)
        ]

        if (list.includes(false)) {
            return {msg: "Incorrect data"};
        }

        return await Rating.create({value, user_id, movie_id});

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


const getRating = async (id) => {
    try {

        let rating = await Rating.findOne({
            where: {
                id: id
            }
        });

        if (rating === null) {
            return {msg: "Rating not found"};
        }

        return rating;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


const putRating = async (id, value) => {
    try {

        let rating = await Rating.findOne({
            where: {
                id: id
            }
        });

        if (rating === null) {
            return {msg: "Rating not found"};
        }

        value = parseInt(value, 10);

        await Rating.update({value: value}, {where: {id: id}});

        rating.value = value;
        return rating;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }

};


const destroyRating = async (id) => {
    try {

        let rating = await Rating.findByPk(id);

        if (rating === null) {
            return {msg: "Movie not found"};
        }

        await Rating.destroy({where: {id: rating.id}});

        return {msg: `Rating with id: ${rating.id} has been successfully deleted`};

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
}


const putWatchedMovies = async ({user_id, movies}) => {
    try {

        let list = [
            await check_existing_data(User, user_id),
        ]

        for (let movie_id of movies) {
            list.push(await check_existing_data(Movie, movie_id))
        }

        if (list.includes(false)) {
            return {msg: "Incorrect data"};
        }

        await UserWatchedMovie.destroy({
            where: {
                user_id: user_id
            }
        });

        for (let movie_id of movies) {
            await UserWatchedMovie.create({user_id, movie_id});
        }

        return movies;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


const getWatchedMovies = async (user_id) => {
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

        return movies;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};

const putPreferences = async ({user_id, genres}) => {
    try {

        let list = [
            await check_existing_data(User, user_id),
        ]

        for (let genre_id of genres) {
            list.push(await check_existing_data(Genre, genre_id))
        }

        if (list.includes(false)) {
            return {msg: "Incorrect data"};
        }

        await UserPreference.destroy({
            where: {
                user_id: user_id
            }
        });

        for (let genre_id of genres) {
            await UserPreference.create({user_id, genre_id});
        }

        return genres;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


const getPreferences = async (user_id) => {
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

        return genres;

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
};


module.exports = {
    createUser,
    getUserById,
    createGenre,
    listGenre,
    getGenre,
    createMovie,
    listMovie,
    getMovie,
    putMovie,
    destroyMovie,
    createRating,
    getRating,
    putRating,
    destroyRating,
    putWatchedMovies,
    getWatchedMovies,
    putPreferences,
    getPreferences,
};
