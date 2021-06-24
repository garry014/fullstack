const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Message = db.define('message',{
    sentby:{
        type: Sequelize.STRING
    },
    timestamp:{
        type: Sequelize.STRING
    },
    message:{
        type: Sequelize.STRING
    },
    upload:{
        type: Sequelize.STRING
    }
})

module.exports = Message;