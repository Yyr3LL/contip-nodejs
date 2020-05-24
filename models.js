const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize('postgres://yyr3ll:7331@localhost:5432/db');


const User = sequelize.define('User', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },

    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    email: {
        type: DataTypes.STRING,
        defaultValue: "",
        unique: true
    },

    password: {
        type: DataTypes.STRING(64),
        is: /^[0-9a-f]{64}$/i
    }

});


const Genre = sequelize.define('Genre', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }

}, {timestamps: false});


const Movie = sequelize.define('Movie', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    imdb: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    tmdb: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

}, {timestamps: false});


const Movie_Genre = sequelize.define('Movie_Genre', {

    movie_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Movie,
            key: 'id',
        },
        validate: {
            isInt: true,
            min: 0
        }

    },

    genre_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Genre,
            key: 'id',
        },
        validate: {
            isInt: true,
            min: 0
        }
    },

}, {timestamps: false});


Movie.belongsToMany(Genre, {
    through: 'Movie_Genre',
    onDelete: 'CASCADE',
    foreignKey: 'movie_id'
});

Genre.belongsToMany(Movie, {
    through: 'Movie_Genre',
    onDelete: 'CASCADE',
    foreignKey: 'genre_id'
});


const Rating = sequelize.define('Rating', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },

    value: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: true,
            min: 0,
            max: 100
        }
    },

    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
        validate: {
            isInt: true,
            min: 0
        }

    },

    movie_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Movie,
            key: 'id',
        },
        validate: {
            isInt: true,
            min: 0
        }
    },

}, {timestamps: false});


const UserPreferences = sequelize.define('UserPreferences', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        validate: {
            isInt: true,
            min: 0
        }
    },

    genre_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Genre,
            key: 'id',
        },
        validate: {
            isInt: true,
            min: 0
        }
    },

}, {timestamps: false});


const UserWatchedList = sequelize.define('UserWatchedList', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        validate: {
            isInt: true,
            min: 0
        }
    },

    movie_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Movie,
            key: 'id',
        },
        validate: {
            isInt: true,
            min: 0
        }
    },

}, {timestamps: false});


if (process.argv[2] === "sync") {
    (async () => {
        await sequelize.sync({force: true});

    })();
}

module.exports = {
    User,
    Genre,
    Movie,
    Movie_Genre,
    Rating,
    UserPreferences,
    UserWatchedList
}
