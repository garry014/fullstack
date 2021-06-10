const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Chat = db.define('chat',{
    sender:{
        type:Sequelize.STRING
    },
    recipient:{
        type:Sequelize.STRING
    },
    senderstatus:{
        type:Sequelize.STRING
    },
    recipientstatus: {
        type:Sequelize.STRING
    },
    message: {
        type:Sequelize.STRING
    }
});

module.exports = Chat;