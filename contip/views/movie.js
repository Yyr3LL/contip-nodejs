
const {Genre} = require('../models');
const {Movie} = require('../models');
const {Movie_Genre} = require('../models');

const check_all_data = require('../service').check_all_data;
const get_clear_movie = require('../service').get_clear_movie;
const unique_constraint_checking = require('../service').unique_constraint_checking;


const createMovie = async (req, res) => {
    const {title, imdb, tmdb, genres} = await req.body;
    try {

        if (!await check_all_data(Genre, genres)) {
            return res.status(202).send({
                msg: 'Given genres don\'t exist'
            });
        }

        let movie;

        movie = await unique_constraint_checking(
            Movie,
            {title, imdb, tmdb},
            "movie"
        );

        if (movie.hasOwnProperty('msg')) {
            return res.status(movie.code).send(movie.msg);
        }


        const cur_movie_id = movie.id;

        for (let genre of genres) {
            await Movie_Genre.create({movie_id: cur_movie_id, genre_id: genre});
        }

        movie = await Movie.findOne({
            where: {
                id: movie.id
            },
            include: Genre
        })

        return res.send(await get_clear_movie(movie));

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({msg: "Something went wrong"});
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
        res.status(202).send({
            msg: 'Something went wrong',
            err: `${err.name}`
        });
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
            res.sendStatus(404);
            // res.send({ msg: 'Movie not found' });
        }

        res.send(await get_clear_movie(movie));

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({msg: "Something went wrong"});
    }
};


const putMovie = async (req, res) => {
    const id = await req.params.id;
    const body = await req.body;
    try {

        // Checking if all the values were provided
        const fields = ['title', 'imdb', 'tmdb', 'genres'];

        if (fields.map(field => {
            return body.hasOwnProperty(field);
        }).includes(false)) {

            return res.status(400).send({
                msg: "Please provide all the values"
            });

        }


        let movie = await Movie.findOne({
            where: {
                id: id
            },
            include: Genre
        });

        if (movie === null) {
            return res.status(400).send({
                msg: "Movie not found"
            });
        }

        movie = await get_clear_movie(movie);


        if (!await check_all_data(Genre, body.genres)) {
            return res.status(202).send({
                msg: 'Given genres don\'t exist'
            });
        }

        await Movie_Genre.destroy({where: {movie_id: id}});

        for (let genre_id of body.genres) {
            await Movie_Genre.create({movie_id: id, genre_id: genre_id});
        }

        await Movie.update(body, {where: {id: id}});

        for (const field of fields) {
            movie['dataValues'][field] = body[field];
        }

        return res.send(movie);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({
            msg: 'Something went wrong',
            err: `${err.name}`
        });
    }
};


const destroyMovie = async (req, res) => {
    const id = await req.params.id;
    try {

        let movie = await Movie.findByPk(id);

        if (movie === null) {
            return {msg: "Movie not found"};
        }

        // await Movie_Genre.destroy({where: {movie_id: movie.id}});
        await Movie.destroy({where: {id: movie.id}});

        res.status(204);
        res.send({msg: `Movie with id: ${movie.id} has been successfully deleted`});

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        res.status(202).send({msg: "Something went wrong"});
    }
};


module.exports = {
    createMovie,
    listMovie,
    getMovie,
    putMovie,
    destroyMovie
}
