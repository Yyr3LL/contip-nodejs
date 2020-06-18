const User = require('../models').User;
const Movie = require('../models').Movie;
const Rating = require('../models').Rating;

const check_existing_data = require('../service').check_existing_data;

const createRating = async (req, res) => {
    const { value, movie_id } = await req.body;
    const user_id = await req.user.id;
    try {

        let list = [
            await check_existing_data(User, user_id),
            await check_existing_data(Movie, movie_id)
        ]

        if (list.includes(false)) {
            return { msg: "Incorrect data" };
        }

        let rating_value = parseInt(value, 10);

        return res.status(200).send(await Rating.create({ rating_value, user_id, movie_id }));

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({ msg: "Something went wrong" });
    }
};


const getRating = async (req, res) => {
    const id = await req.params.id;
    try {

        let rating = await Rating.findOne({
            where: {
                id: id
            }
        });

        if (rating === null) {
            return { msg: "Rating not found" };
        }

        res.send(rating);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
};


const putRating = async (req, res) => {
    const id = await req.params.id;
    const value = await req.body.value;
    const user_id = await req.user.id;
    try {

        let rating = await Rating.findOne({
            where: {
                id: id
            }
        });

        if (rating === null) {
            return { msg: "Rating not found" };
        }

        if (rating.user_id !== user_id) return { msg: "You have no rights to remove that rating obj" };

        value = parseInt(value, 10);

        await Rating.update({ value: value }, { where: { id: id } });

        rating.value = value;
        res.send(movie);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
}


const destroyRating = async (req, res) => {
    const id = await req.params.id;
    const user_id = await req.user.id;
    try {

        let rating = await Rating.findByPk(id);

        if (rating === null) {
            return { msg: "Rating not found" };
        }

        if (rating.user_id !== user_id) return { msg: "You have no rights to remove that rating obj" };

        await Rating.destroy({ where: { id: rating.id } });

        res.status(204);
        res.send({ msg: `Rating with id: ${rating.id} has been successfully deleted` });

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
}


module.exports = {
    createRating,
    getRating,
    putRating,
    destroyRating
}
