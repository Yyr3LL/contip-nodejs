require('dotenv').config();

const sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models').User;
const Genre = require('../models').Genre;
const Movie = require('../models').Movie;
const Movie_Genre = require('../models').Movie_Genre;
const Rating = require('../models').Rating;
const UserWatchedMovie = require('../models').UserWatchedMovie;
const UserPreference = require('../models').UserPreference;

const check_existing_data = require('./service').check_existing_data;
const get_clear_movie = require('./service').get_clear_movie;


const seq = new sequelize.Sequelize('postgres://yyr3ll:7331@localhost:5432/db');
