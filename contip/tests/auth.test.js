const request = require('supertest');

const get_server = require('./service').get_server;
const create_user = require('./service').create_user;
const get_auth_tokens = require('./service').get_auth_tokens;
const clean_db = require('./service').clean_db;

let server;

describe('Auth', () => {

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
        'has access to resource with a token',
        async () => {
            const login = await get_auth_tokens(server);

            const res = await request(server)
                .get('/api/v1/app/genre')
                .set({Authorization: `Bearer ${login.access}`});

            expect(res.statusCode).toEqual(200);
        }
    )

    it(
        'has no access to resource without a token',
        async () => {
            const res = await request(server)
                .get('/api/v1/app/genre')

            expect(res.statusCode).toEqual(401);
        }
    )

    it(
        'it can refresh token and get access',
        async () => {
            const login = await get_auth_tokens(server);

            const new_access_token = await request(server)
                .post('/api/v1/app/refresh')
                .send({
                    token: login.refresh
                })
            const res = await request(server)
                .get('/api/v1/app/genre')
                .set({Authorization: `Bearer ${new_access_token.body.access}`})

            expect(res.statusCode).toEqual(200);
        }
    )
})
