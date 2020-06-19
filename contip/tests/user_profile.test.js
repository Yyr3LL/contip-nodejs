const request = require('supertest');

const get_auth_tokens = require('./service').get_auth_tokens;
const clean_db = require('./service').clean_db;


describe('Movies', () => {

    let _server;
    let _genres = [];
    let _movies = [];
    let login;

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
        login = await get_auth_tokens(server);

        // Creating some genres
        const genre_requests = [
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


        for (const req of genre_requests) {
            _genres.push(await req.body.id);
        }


        // Creating some movies
        const movie_requests = [
            await request(server)
                .post('/api/v1/app/movie/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    title: 'some movie',
                    imdb: 123,
                    tmdb: 321,
                    genres: [
                        _genres[0],
                        _genres[1],
                    ]
                }),
            await request(server)
                .post('/api/v1/app/movie/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    title: 'another movie',
                    imdb: 228,
                    tmdb: 999,
                    genres: [
                        _genres[2],
                        _genres[1],
                    ]
                }),
            await request(server)
                .post('/api/v1/app/movie/create')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    title: 'BRUH movie',
                    imdb: 1337,
                    tmdb: 55555,
                    genres: [
                        _genres[0],
                        _genres[1],
                        _genres[2],
                    ]
                }),
        ]


        for (const req of movie_requests) {
            _movies.push(await req.body.id);
        }


    })

    afterAll(async () => {

        // Closing server instance
        await server.close();

    });


    it(
        'it can add a movie to watched list',
        async () => {
            const res = await request(server)
                .put('/api/v1/app/watched')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    movies: [
                        {
                            movie_id: _movies[0],
                            value: 50,
                        },
                        {
                            movie_id: _movies[1],
                            value: 30,
                        },
                    ]
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
        }
    )


    it(
        'it can add a movie to watched list without a rating value',
        async () => {
            const res = await request(server)
                .put('/api/v1/app/watched')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    movies: [
                        {
                            movie_id: _movies[0],
                            value: 50,
                        },
                        {
                            movie_id: _movies[2]
                        }
                    ]
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
        }
    )


    it(
        'it can get list of watched movies',
        async () => {
            const res = await request(server)
                .get('/api/v1/app/watched')
                .set({Authorization: `Bearer ${login.access}`});


            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body.length).toEqual(2);
        }
    )


    it(
        'it can change genres in preferences list',
        async () => {
            const res = await request(server)
                .put('/api/v1/app/preferences')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    genres: [
			_genres[0],
			_genres[1],
                    ]
                });


            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body.length).toEqual(2);
        }
    )


    it(
        'it can\'t add invalid genre ids to preferences list',
        async () => {
            const res = await request(server)
                .put('/api/v1/app/preferences')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
                    genres: [
			10000,
			228,
                    ]
                });


            expect(res.statusCode).toEqual(400);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body.msg).toEqual('Incorrect data');
        }
    )


    it(
        'it can\'t send invalid data',
        async () => {
            const res = await request(server)
                .put('/api/v1/app/preferences')
                .set({Authorization: `Bearer ${login.access}`})
                .send({
		    fuzz: 'buzz'
                });


            expect(res.statusCode).toEqual(400);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body.msg).toEqual('Incorrect data');
        }
    )

})
