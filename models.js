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

    hashedPassword: {
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
        allowNull: false
    },

});


const Movie = sequelize.define('Movie', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    }

});


const Movie_Genre = sequelize.define('Movie_Genre', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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

});


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

});


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

});


(async () => {
    await sequelize.sync({force: true});
})();
