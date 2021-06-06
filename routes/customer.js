// /customer/___________

const express = require('express');
const router = express.Router();
var validator = require('validator');
const alertMessage = require('../helpers/messenger');
const db = require('../config/DBConfig.js');
const { username, password } = require('../config/db');

module.exports = router;

// customer: login page 
router.get('/custlogin', (req, res) => {
	alertMessage(res, 'success',
		'You have logged in successfully!', 'fas fa-sign-in-alt', true);
	alertMessage(res, 'danger',
		'Login was unsuccessful. Please try again! ', 'fas fa-exclamation-circle', false);
	res.render('customer/custlogin');
});

router.get('/custregister', (req, res) => {
	res.render('customer/custregister', { title: "Registration"});
});

// customer: register 
router.post('/custregister', (req, res) => {
    let errors = [];
    // Checks if both passwords entered are the same
	if (req.body.password !== req.body.password2) {
		errors.push({
			msg: 'Passwords do not match'
		});
	}
	// Checks that password length is more than 4 (upgrade this to include checking for special characters etc)
	if (req.body.password.length < 8) {
		errors.push({
			msg: 'Password must be at least 8 characters'
		});
	}
	console.log(req.body.firstname);
    /*
	 If there is any error with password mismatch or size, then there must be
	 more than one error message in the errors array, hence its length must be more than one.
	 In that case, render register.handlebars with error messages.
	 */
	if (errors.length > 0) {
		res.render('customer/custregister', {
			errors: errors,
			firstname: req.body.firstname,
            lastname: req.body.lastname,
			username: req.body.username,
			password: req.body.password,
			password2: req.body.password2,
            address: req.body.address,
            address2: req.body.address2,
            city: req.body.city,
            postalcode: req.body.postalcode,
            gender: req.body.gender,
            email: req.body.email,
            phoneno: req.body.phoneno
		});
	} else {
		let success_msg = `${req.body.email} registered successfully`;
		res.render('/custregcomplete', {
			success_msg // or sucess_msg: success_msg
		});
	}
});
// customer: registration complete 
router.get('/custregcomplete', (req, res) => {
	res.render('customer/custregcomplete');
});

module.exports = router;
