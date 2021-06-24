const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
// variables that kaijie + amelia need are name,address,duedate,custname.

const sqlcart = db.define('Cart', {
    //itemname
    name: {
        type: Sequelize.STRING
    },
    //itemprice
    price: {
        type: Sequelize.DOUBLE
    },
    //item qty
    quantity: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        defaultValue : 0
    },
    //item customqn
    customqn: {
        type: Sequelize.STRING(2000)
    },
    //item custom choices
    custom: {
        type: Sequelize.STRING(2000)
    },
    timestamp: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    userid: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }


});
module.exports = sqlcart;
