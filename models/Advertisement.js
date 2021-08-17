const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Advertisement = db.define('Advertisement', {
    userId: {
        type: Sequelize.INTEGER
    },
    storename:{
        type: Sequelize.STRING
    },
    Image: {
        type: Sequelize.STRING
    },
    startDate: {
        type: Sequelize.DATE
    },
    endDate: {
        type: Sequelize.DATE
    },
    // advertisement text
    adText: {
        type: Sequelize.STRING
    },
    Action: {
        type: Sequelize.STRING
    },
});

module.exports = Advertisement;
