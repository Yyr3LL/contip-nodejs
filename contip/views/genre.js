const Genre = require('../models').Genre;


const createGenre = async (req, res) => {
    const { name } = await req.body;
    let genre;
    try {
        genre = await Genre.create({ name });

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        return res.status(202).send({ msg: "Something went wrong" });
    }
    res.send(genre);
};


const listGenre = async (req, res) => {
    try {

        res.status(200).send(await Genre.findAll());

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        res.status(202).send({ msg: "Something went wrong" });
    }
};


const getGenre = async (req, res) => {
    const id = await req.params.id;
    try {

        const genre = await Genre.findByPk(id);
        if (genre === null) {
            return { msg: "Genre with id of " + id + " not found" };
        }
        res.send(genre);

    } catch (err) {
        console.log(`Error: ${err.name}  ${err.stack}`);
        res.status(202).send({ msg: "Something went wrong" });
    }
};

module.exports = {
    createGenre,
    listGenre,
    getGenre
}