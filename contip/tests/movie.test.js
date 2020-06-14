const request = require('supertest');

const get_auth_tokens = require('./service').get_auth_tokens;
const clean_db = require('./service').clean_db;


describe('Movies', () => {

    let _server;
    let movie_id;
    let _genres = [];

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

        // Logging in
        const login = await get_auth_tokens(server);

        // Creating some genres for movies
        const requests = [
            await request(server)
                .post('/api/v1/app/genre/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    name: "some_genre"
                }),
            await request(server)
                .post('/api/v1/app/genre/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    name: "another_genre"
                }),
            await request(server)
                .post('/api/v1/app/genre/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    name: "weird_genre"
                })
        ]

        for (const req of requests) {
            _genres.push(await req.body.id);
        }

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
                    genres: _genres
                });

            movie_id = await res.body.id;

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty('genres');
            expect(res.body.genres).toBeInstanceOf(Array);
            expect(res.body.genres.length).toEqual(3);
        }
    )


    it(
        'it can\'t create a movie with already existing title',
        async () => {
            const login = await get_auth_tokens(server);

            const res = await request(server)
                .post('/api/v1/app/movie/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    title: "Some Moive (1994)",
                    imdb: 34,
                    tmdb: 133,
                    genres: _genres
                });

            expect(res.statusCode).toEqual(202);
            expect(res).toHaveProperty('body');
            expect(res.body).toHaveProperty('msg');
        }
    )


    it(
        'it can\'t create a movie with invalid genres',
        async () => {
            const login = await get_auth_tokens(server);

            const res = await request(server)
                .post('/api/v1/app/movie/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    title: "Another Moive (2007)",
                    imdb: 34,
                    tmdb: 133,
                    genres: [123, 999, 1488, 1337]
                });

            expect(res.statusCode).toEqual(202);
            expect(res).toHaveProperty('body');
            expect(res.body).toHaveProperty('msg');
        }
    )


    it(
        'it can edit the movie',
        async () => {
            const login = await get_auth_tokens(server);

            const local_genres = [
                _genres[0],
                _genres[2]
            ];

            const res = await request(server)
                .put(`/api/v1/app/movie/${movie_id}`)
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    title: "Some Moive (1994)",
                    imdb: 34,
                    tmdb: 133,
                    genres: local_genres
                });


            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty('genres');
            expect(res.body.genres).toBeInstanceOf(Array);
            expect(res.body.genres.length).toEqual(2);
        }
    )
})
