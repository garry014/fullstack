const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Deal = db.define('deals', {
    pname: {
        type: Sequelize.STRING
    },
    discountp: {
        type: Sequelize.DOUBLE
    },
    dstartdate: {
        type: Sequelize.STRING
    },
    dexpirydate: {
        type: Sequelize.STRING  
    },
});
module.exports = Deal;