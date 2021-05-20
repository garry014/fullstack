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
    custom: {
        type: Sequelize.STRING(1000),
        get() {
            return this.getDataValue('custom').split(';');
        },
        set(val) {
            this.setDataValue('custom', val.join(';'));
        },
    },
    customchoices: {
        type: Sequelize.STRING(1000)
    },
});
module.exports = Catalouge;
