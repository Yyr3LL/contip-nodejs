const request = require('supertest');

const get_auth_tokens = require('./service').get_auth_tokens;
const clean_db = require('./service').clean_db;

let _server;
let _genres = [];

describe('Movies', () => {

    beforeAll(async () => {

        clean_db();

        // Creating new server instance
        server = require('../../server');

        // Creating a user to auth with
        await request(server)
            .post('/api/v1/app/signup')
            .send({
                username: 'user',
                email: 'asd@asd.com',
                password: '123',
                re_password: '123'
            });

        // Creating some genres for movies
        const genre1 = await request(server)
            .post('/api/v1/app/genre/create')
            .send({
                name: "some_genre"
            });
        const genre2 = await request(server)
            .post('/api/v1/app/genre/create')
            .send({
                name: "another_genre"
            });
        const genre3 = await request(server)
            .post('/api/v1/app/genre/create')
            .send({
                name: "weird_genre"
            });

        _genres = [
            genre1.body.id
        ]
        console.log("################################################", _genres);

    })

    afterAll(async () => {

        // Closing server instance
        await server.close();

    });

    it(
        'it can create a movie',
        async () => {
            const login = await get_auth_tokens(server);
            const res = await request(server)
                .post('/api/v1/app/movie/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    title: "Some Moive (1994)",
                    imdb: 34,
                    tmdb: 133,
                    genres: [
                        1, 3
                    ]
                })
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body.genres).toBeInstanceOf(Array);
            expect(res.body.genres.length).toEqual(2);
        }
    )

})