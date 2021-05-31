const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Message = db.define('chat',{
    sentby:{
        type: Sequelize.STRING
    },
    timestamp:{
        type: Sequelize.DATE
    },
    message:{
        type: Sequelize.STRING
    }
})

module.exports = Message;