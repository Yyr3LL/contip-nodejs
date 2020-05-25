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


module.exports = {
    get_clear_movie,
    check_existing_data
}
