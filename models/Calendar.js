const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Calendar = db.define('cal', {

    eventtitle: {
        type: Sequelize.STRING
    },
    startdate: {
		type: Sequelize.DATE
	},
    enddate: {
		type: Sequelize.DATE
	},
  note: {
    type: Sequelize.STRING(1000)
  },
    // stime: {
    //     type: Sequelize.STRING
    // },
    // etime: {
    //     type: Sequelize.STRING
    // }
    user: {
		type: Sequelize.INTEGER
	}


});
module.exports = Calendar;
