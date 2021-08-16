const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Deal = db.define('deals', {
    catid: {
        type: Sequelize.STRING
    },
    discountp: {
        type: Sequelize.DECIMAL(10,2)
    },

    event: {
        type: Sequelize.STRING
    },
    
    dstartdate: {
        type: Sequelize.DATE
    },
    dexpirydate: {
        type: Sequelize.DATE  
    },
    userID:{
        type: Sequelize.INTEGER
    }
});
module.exports = Deal;
