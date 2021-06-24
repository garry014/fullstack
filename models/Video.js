const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Video = db.define('videocontent', {
	topic: {
		type: Sequelize.STRING
	},

	video: {
		type: Sequelize.STRING
	},

    courseid: {
		type: Sequelize.INTEGER
	}
    
});

module.exports = Video;
