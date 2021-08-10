const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Voucher = db.define('vouchers', {
    code: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.STRING
    },
    discount: {
        type: Sequelize.DOUBLE
    },
    minpurchase: {
        type: Sequelize.DOUBLE
    },
    quantity: {
        type: Sequelize.DOUBLE
    },
    vstartdate: {
        type: Sequelize.DATE
    },
    vexpirydate: {
        type: Sequelize.DATE
    }
});
module.exports = Voucher;
