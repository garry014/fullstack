const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Course = db.define('course', {
	ctitle: {
		type: Sequelize.STRING
	},
	language: {
		type: Sequelize.STRING
	},
	day: {
		type: Sequelize.STRING
	},
	
	material: {
		type: Sequelize.STRING(1000)
	},
	description: {
		type: Sequelize.STRING(3000)
	},
	
	price: {
		type: Sequelize.DOUBLE
	},

    thumbnail: {
		type: Sequelize.STRING
	},

	user: {
		type: Sequelize.INTEGER
	}
    
});

module.exports = Course;
