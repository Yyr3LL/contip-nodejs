const sequelize = require('sequelize');
const User = require('../models').User;
const Genre = require('../models').Genre;


const seq = new sequelize.Sequelize('postgres://yyr3ll:7331@localhost:5432/db');

const createUser = async ({username, email, password, re_password}) => {
    if (password === re_password) {
        try {
            return await User.create({username, email, password, re_password});
        } catch (err) {
            console.log("Error: " + ":" + err.name + "\n" + err.stack);
        }
    }

    return {msg: "re_password does not match"};
};


const getUserById = async ({id}) => {
    let user = await seq.query(`SELECT \"id\", \"username\", \"email\", \"createdAt\", \"updatedAt\" FROM \"Users\" AS \"User\" WHERE \"User\".\"id\" = ${id};\n`)
    delete user.password;
    return user[0][0];

};


const createGenre = async ({name}) => {
    try {
        return await Genre.create({name});
    } catch (err) {
        console.log("Error: " + ":" + err.name + "\n" + err.stack);
        return {msg: "Something went wrong"};
    }
};


const listGenre = async () => {
    try {
        return await Genre.findAll();
    } catch (err) {
        console.log("Error: " + ":" + err.name + "\n" + err.stack);
        return {msg: "Something went wrong"};
    }
};


const getGenre = async (id) => {
    try {
        const genre = await Genre.findByPk(id);
        if (genre === null) {
            return {msg: "Genre with id of " + id + " not found"}
        }
        return genre;
    } catch (err) {
        console.log("Error: " + ":" + err.name + "\n" + err.stack);
        return {msg: "Something went wrong"};
    }
};


module.exports = {
    createUser,
    getUserById,
    createGenre,
    listGenre,
    getGenre
};