const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const RidersOrders = db.define('RidersOrders', {
    cust_username: {
        type: Sequelize.STRING
    },
    rider_username: {
        type: Sequelize.STRING
    },
    des_address: {
        type: Sequelize.STRING
    },
    pickup_address: {
        type: Sequelize.STRING
    },
    deliverytime: {
        type: Sequelize.STRING
    },
    deliverydate: {
        type: Sequelize.DOUBLE
    },
    deliveryfee:{
        type:Sequelize.STRING
    },
    OrderStatus:{
        type:Sequelize.STRING
    },
    TimeOrdersCompleted:{
        type: Sequelize.INTEGER
    }
});
module.exports = RidersOrders;
