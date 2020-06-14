const check_existing_data = async (model, instance_id) => {

    return await model.findOne({
        where: {
            id: instance_id
        }
    }) !== null;

};


const check_all_data = async (model, data) => {

    if (typeof data === 'number') {
        return await model.findOne({
            where: {
                id: data
            }
        }) !== null;
    }

    if (!Array.isArray(data)) return false;

    data = data.map(item => {
        return item;
    })

    for (const instance_id of data) {
        if (await model.findOne({
            where: {
                id: instance_id
            }
        }) === null) return false;
    }

    return true;

};


const get_clear_movie = async (movie) => {

    movie['dataValues']['genres'] = movie['dataValues']['Genres'].map(item => {
        return item.id
    });

    delete movie['dataValues']['Genres']

    return movie;
}


const unique_constraint_checking = async (model, args, model_name) => {

    try {
        const movie = model.create(args);
        return movie;
    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return {
                msg: `A ${model_name} with given name/title already exists`,
                code: 202
            }
        }

    }

}


module.exports = {
    get_clear_movie,
    check_existing_data,
    unique_constraint_checking,
    check_all_data
}
