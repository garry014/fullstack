const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Target = db.define('target', {
    value: {
        type: Sequelize.INTEGER
    },
});
module.exports = Target;
