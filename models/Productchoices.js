const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Productchoices = db.define('productchoices',{
    choice: {
        type: Sequelize.STRING
    },
});

module.exports = Productchoices;