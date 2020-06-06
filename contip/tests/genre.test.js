const request = require('supertest');

const get_server = require('./service').get_server;
const create_user = require('./service').create_user;
const get_auth_tokens = require('./service').get_auth_tokens;
const clean_db = require('./service').clean_db;

let server;

describe('Genres', () => {

    beforeAll(async () => {
        server = require('../../server');
        clean_db();
        await request(server)
            .post('/api/v1/app/signup')
            .send({
                username: 'user',
                email: 'asd@asd.com',
                password: '123',
                re_password: '123'
            });
    })

    afterAll(async () => {
        await server.close();
    });

    it(
        'it can create a genre',
        async done => {
            const login = await get_auth_tokens(server);
            const res = await request(server)
                .post('/api/v1/app/genre/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send(
                    {
                        name: 'some_genre',
                    }
                )
            const res2 = await request(server)
                .post('/api/v1/app/genre/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send(
                    {
                        name: 'another_genre',
                    }
                )
            const res3 = await request(server)
                .post('/api/v1/app/genre/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send(
                    {
                        name: 'weird_genre',
                    }
                )
            expect(res.statusCode).toEqual(200);
            done();
        }
    )

    it(
        'it can get list of genres',
        async done => {
            const login = await get_auth_tokens(server);
            const res = await request(server)
                .get('/api/v1/app/genre')
                .set({Authorization: `Bearer ${login.access}`})
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeTruthy();
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toEqual(3);
            done();
        }
    )


})
