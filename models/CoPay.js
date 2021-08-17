const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const CoPay = db.define('copay', {

    courseid: {
        type: Sequelize.INTEGER
    },
    price: {
        type: Sequelize.DOUBLE
    },
    tailor: {
        type: Sequelize.STRING
    },
    ctitle: {
        type: Sequelize.STRING
    },
    cuser: {
        type: Sequelize.INTEGER
    },
    description: {
		type: Sequelize.STRING(3000)
	},
    thumbnail: {
		type: Sequelize.STRING
	},


});
module.exports = CoPay;
