const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Notifications = db.define('notification',{
    hyperlink:{
        type:Sequelize.STRING
    },
    category:{
        type:Sequelize.STRING
    },
    message:{
        type:Sequelize.STRING
    },
    recipient: {
        type:Sequelize.STRING
    },
    status:{
        type:Sequelize.STRING
    },
    time:{
        type:Sequelize.STRING
    }
});

module.exports = Notifications;