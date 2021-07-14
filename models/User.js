const Sequelize = require('sequelize');
const { username } = require('../config/db');
const db = require('../config/DBConfig');

/* 	Creates a user(s) table in MySQL Database. 
	Note that Sequelize automatically pleuralizes the entity name as the table name
*/
// need to change the type of string 
const User = db.define('User', { 	
	firstname: {
		type: Sequelize.STRING
	},
    lastname: {
		type: Sequelize.STRING
	},
    username: {
		type: Sequelize.STRING
	},
	password: {
		type: Sequelize.STRING
	},
	address1: {
		type: Sequelize.STRING
	},
    address2: {
		type: Sequelize.STRING
	},
    city: {
		type: Sequelize.STRING
	},
    postalcode: {
		type: Sequelize.STRING
	},
	shopname: {
		type: Sequelize.STRING
	},
    gender: {
		type: Sequelize.STRING
	},
    email: {
		type: Sequelize.STRING
	},
    phoneno: {
		type: Sequelize.STRING
	},
	transport: {
		type: Sequelize.STRING
	},
	licenseno: {
		type: Sequelize.STRING
	},
	photo: {
		type: Sequelize.STRING
	},
	usertype: {
		type: Sequelize.STRING
	},
	facebook_id: {
		type: Sequelize.STRING
	},
	google_id: {
		type: Sequelize.STRING
	},
	verified: {
		type: Sequelize.BOOLEAN
		}
	
});

module.exports = User;