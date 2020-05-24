const sequelize = require('sequelize');
const User = require('../models').User;
const Genre = require('../models').Genre;
const Movie = require('../models').Movie;
const Movie_Genre = require('../models').Movie_Genre;
const Rating = require('../models').Rating;


const seq = new sequelize.Sequelize('postgres://yyr3ll:7331@localhost:5432/db');


const createUser = async ({username, email, password, re_password}) => {
    if (password === re_password) {
        try {
            return await User.create({username, email, password, re_password});
        } catch (err) {
            console.log(`Error: ${err.name}  ${err.stack}`);
        }
    }

    return {msg: "re_password does not match"};
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


const get_clear_movie = async (movie) => {

    movie['dataValues']['genres'] = movie['dataValues']['Genres'].map(item => {
        return item.id
    });

    delete movie['dataValues']['Genres']

    return movie;
}

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

        let fields = ['title', 'imdb', 'tmdb', 'genres'];
        let data = {};

        for (let field of fields) {
            if (field in body) {
                [data[field], movie[field]] = [body[field], body[field]]
            }
        }

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

        await Movie_Genre.destroy({where: {movie_id: movie.id}});
        await Movie.destroy({where: {id: movie.id}});

        return {msg: `Movie with id: ${movie.id} has been successfully deleted`};

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return {msg: "Something went wrong"};
    }
}


const check_invalid_rating_values = async (user_id, movie_id) => {

    let msg = {};

    if (!await Movie.findOne({
        where: {
            id: movie_id
        }
    })) {
        msg['movie_err'] = '\nMovie not found';
    }

    if (!await User.findOne({
        where: {
            id: user_id
        }
    })) {
        msg['user_err'] = '\nUser not found';
    }

    if ('movie_err' in msg || 'user_err' in msg) {
        return msg;
    }

    return false;

};

const createRating = async ({value, movie_id, user_id}) => {
    try {

        msg = check_invalid_rating_values({user_id, movie_id});

        if (!msg) {
            return msg;
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


const putRating = async ({id, body}) => {
    try {

        console.log(id);
        let rating = await Rating.findOne({
            where: {
                id: id
            }
        });

        if (rating === null) {
            return {msg: "Rating not found"};
        }

        let fields = ['value', 'user_id', 'movie_id'];
        let data = {}
        let msg;

        for (let field of fields) {
            if (field in body) {
                [rating[field], data[field]] = [body[field], body[field]];
            }
        }

        if (data.hasOwnProperty('user_id') && data.hasOwnProperty('movie_id')) {
            msg = await check_invalid_rating_values(data.user_id, data.movie_id);

            if (!msg) {
                Rating.update(data, {where: {id: id}});
                return rating;
            }

            return msg;
        }

        return {msg: "Not all the values were provided"};

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
    destroyRating
};