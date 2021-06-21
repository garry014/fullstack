const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Review = db.define('review', {
    username: {
        type: Sequelize.STRING
    },
    photo: {
        type: Sequelize.STRING
    },
    review: {
        type: Sequelize.STRING(2000)
    },
    stars: {
        type: Sequelize.INTEGER
    },
    timestamp: {
        type: Sequelize.STRING(250),
    },
    productid: {
        type: Sequelize.STRING
    }
});
module.exports = Review;
