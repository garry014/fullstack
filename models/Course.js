const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Course = db.define('course', {
	title: {
		type: Sequelize.STRING
	},
	language: {
		type: Sequelize.STRING
	},
	day: {
		type: Sequelize.STRING
	},
	
	material: {
		type: Sequelize.STRING
	},
	description: {
		type: Sequelize.STRING
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
