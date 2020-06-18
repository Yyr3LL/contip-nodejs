const request = require('supertest');
const {Sequelize} = require('sequelize');
const sync_db = require('../models').sync_db;

const get_server = async () => {

    const server = require('../../server');
    return server;

};


const create_user = async (server) => {

    await request(server)
        .post('/api/v1/app/signup')
        .send({
            username: 'user',
            email: 'asd@asd.com',
            password: '123',
            re_password: '123'
        });

}


const get_auth_tokens = async (app) => {
    const res = await request(app)
        .post('/api/v1/app/login')
        .send({
                username: 'user',
                password: '123'
            }
        )
    return {
        access: res.body.access,
        refresh: res.body.refresh
    };
};


const clean_db = async () => {

    const models = [
        require('../models').User,
        require('../models').Genre,
        require('../models').Movie,
        require('../models').Movie_Genre,
        require('../models').UserWatchedMovie,
        require('../models').UserPreference,
    ]

    for (let model of models) {
        await model.destroy({
                where: {}
            }
        );
    }
};


module.exports = {
    get_server,
    create_user,
    get_auth_tokens,
    clean_db
}
