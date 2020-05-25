const sequelize = require('sequelize');


const check_existing_data = async(model, instance_id) => {

    console.log(model);

    return await model.findOne({
        where: {
            id: instance_id
        }
    }) !== null;

};


const get_clear_movie = async (movie) => {

    movie['dataValues']['genres'] = movie['dataValues']['Genres'].map(item => {
        return item.id
    });

    delete movie['dataValues']['Genres']

    return movie;
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


module.exports = {
    get_clear_movie,
    check_existing_data,
    check_invalid_rating_values
}
