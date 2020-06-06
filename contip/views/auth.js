require('dotenv').config();

const redis = require('redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models').User;

const redis_client = redis.createClient();

redis_client.on("error", (err) => {
    console.log(err);
});



const logIn = async (req, res) => {
    const { username, password } = await req.body;
    let data;
    try {

        let user = await User.findOne({
            where: {
                username: username
            }
        });

        if (user === null) return { msg: "User not found" };
        if (!bcrypt.compare(password, user.password)) return { msg: "Wrong password" };

        user = {
            id: user.id,
        };

        const accessToken = jwt.sign(user, process.env.ACCESS, { expiresIn: '2h' })
        const refreshToken = jwt.sign(user, process.env.REFRESH)

        data = { user_id: user.id, access: accessToken, refresh: refreshToken }


    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }

    const response = {
        access: data.access,
        refresh: data.refresh
    }

    redis_client.set(data.user_id, data.refresh, redis.print);

    res.send(response);

}


const getUserInfo = async (req, res) => {
    let user = await seq.query(`SELECT \"id\", \"username\", \"email\", \"createdAt\", \"updatedAt\" FROM \"Users\" AS \"User\" WHERE \"User\".\"id\" = ${token.id};\n`)
    if (user === null) return { msg: "User not found" };
    res.send(user[0][0]);
}

const createUser = async (req, res) => {
    const { username, email, password, re_password } = await req.body;
    try {

        if (password !== re_password) {
            return { msg: "re_password does not match" };
        }
        res.send(await User.create({ username, email, password, re_password }));

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return { msg: "Something went wrong" };
    }
}


const refreshToken = async (req, res) => {
    const refreshToken = req.body.token;

    if (refreshToken === null) return res.sendStatus(401);

    let user_id;

    jwt.verify(refreshToken, process.env.REFRESH, (err, user) => {
        if (err) return res.sendStatus(403);
        user_id = user.id;
    })

    redis_client.get(user_id, (error, reply) => {

        if (error) return res.sendStatus(500);
        if (reply === null) return res.sendStatus(403);

        const accessToken = jwt.sign({ id: user_id }, process.env.ACCESS, { expiresIn: '2h' });
        res.send({ access: accessToken });
    })
}

const logOut = async (req, res) => {
    let user_id;
    const refreshToken = req.body.token;

    if (refreshToken === null) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.REFRESH, (err, user) => {
        if (err) return res.sendStatus(500);
        user_id = user.id;
    })

    redis_client.del(user_id, (err, reply) => {
        if (err) return res.sendStatus(500);
        console.log(reply);
        return res.sendStatus(204);
    });

}

module.exports = {
    logIn,
    logOut,
    getUserInfo,
    refreshToken,
    createUser
}