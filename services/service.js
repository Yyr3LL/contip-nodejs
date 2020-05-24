const sequelize = require('sequelize');
const User = require('../models').User;
const Genre = require('../models').Genre;
const Movie = require('../models').Movie;
const Movie_Genre = require('../models').Movie_Genre;


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
    destroyMovie
};