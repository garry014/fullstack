const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Catalouge = db.define('catalouge', {
    storename: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.DOUBLE
    },
    image: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING(2000)
    },
    discount: {
        type: Sequelize.DOUBLE
    },
    customqn: {
        type: Sequelize.STRING(250),
    },
    customcat: {
        type: Sequelize.STRING(8)
    },
});
module.exports = Catalouge;
