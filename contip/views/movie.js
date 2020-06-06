const Genre = require('../models').Genre;
const Movie = require('../models').Movie;
const Movie_Genre = require('../models').Movie_Genre;

const check_existing_data = require('../service').check_existing_data;
const get_clear_movie = require('../service').get_clear_movie;


const createMovie = async (req, res) => {
    const { title, imdb, tmdb, genres } = await req.body;
    try {

        let movie = await Movie.create({ title, imdb, tmdb });
        const cur_movie_id = movie.id;
        genres.forEach(genre_id => {
            Movie_Genre.create({ movie_id: cur_movie_id, genre_id: genre_id });
        });
        movie = await Movie.findOne({
            where: {
                id: movie.id
            },
            include: Genre
        })

        console.log(movie);
        res.send(await get_clear_movie(movie));

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
}


const listMovie = async (req, res) => {
    try {

        let movies = await Movie.findAll({
            include: Genre
        });

        for (let movie of movies) {
            movie = await get_clear_movie(movie);
        }

        res.send(movies);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: 'Something went wrong' };
    }
};


const getMovie = async (req, res) => {
    const id = await req.params.id;
    try {

        let movie = await Movie.findOne({
            where: {
                id: id
            },
            include: Genre
        });

        if (movie === null) {
            return { msg: 'Movie not found' };
        }

        res.send(await get_clear_movie(movie));

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
};


const putMovie = async (req, res) => {
    const id = await req.params.id;
    const body = await req.body;
    try {

        let movie = await Movie.findOne({
            where: {
                id: id
            },
            include: Genre
        });

        if (movie === null) {
            return { msg: "Movie not found" };
        }

        movie = await get_clear_movie(movie);

        const fields = ['title', 'imdb', 'tmdb', 'genres'];

        if (fields.map(field => {
            return body.hasOwnProperty(field);
        }).includes(false)) {
            return { msg: "Please provide all the values" };
        }

        for (let field of fields) {
            movie[field] = body[field];
        }

        await Movie_Genre.destroy({ where: { movie_id: id } });

        let checking_data = [];

        for (let genre_id of body.genres) {
            checking_data.push(await check_existing_data(Genre, genre_id));
        }

        if (checking_data.includes(false)) {
            return { msg: "Incorrect data" };
        }

        for (let genre_id of body.genres) {
            await Movie_Genre.create({ movie_id: id, genre_id: genre_id });
        }

        await Movie.update(body, { where: { id: id } });

        res.send(movie);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
};


const destroyMovie = async (req, res) => {
    const id = await req.params.id;
    try {

        let movie = await Movie.findByPk(id);

        if (movie === null) {
            return { msg: "Movie not found" };
        }

        // await Movie_Genre.destroy({where: {movie_id: movie.id}});
        await Movie.destroy({ where: { id: movie.id } });

        res.status(204);
        res.send({ msg: `Movie with id: ${movie.id} has been successfully deleted` });

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
};


module.exports = {
    createMovie,
    listMovie,
    getMovie,
    putMovie,
    destroyMovie
}