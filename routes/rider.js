// /rider/___________

const express = require('express');
const router = express.Router();
var validator = require('validator');
const alertMessage = require('../helpers/messenger');
const db = require('../config/DBConfig.js');
const { username, password } = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');

// riders: login page 
router.get('/riderlogin', (req, res) => {
	res.render('rider/riderlogin');
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/homerider',
		failureRedirect: '../rider/riderlogin', // Route to /login URL
		failureFlash: true
	})(req, res, next);
});

// riders: register page 
router.get('/rideregister', (req, res) => {
	res.render('rider/rideregister');
});

// riders: registration complete page
router.get('/rideregcomplete', (req, res) => {
	res.render('rider/rideregcomplete');
});

// customer: register 
// havent add in validation for registration 
// add the account type for the various users 
router.post('/rideregister', (req, res) => {
	let errors = [];
	let { firstname, lastname, username, password, password2, gender, email, phoneno,transport,licenseno,usertype } = req.body;

	// All this are your variables
	console.log(req.body.firstname,
		req.body.lastname,
		req.body.username,
		req.body.password,
		req.body.password2,
		req.body.gender,
		req.body.email,
		req.body.phoneno,
        req.body.transport,
        req.body.licenseno,
		req.body.usertype
		);

	// Checks if both passwords entered are the same
	if (req.body.password !== req.body.password2) {
		errors.push({
			msg: 'Passwords do not match'
		});
	}
	// Checks that password length is more than 8 (upgrade this to include checking for special characters etc)
	if (req.body.password.length < 8) {
		errors.push({
			msg: 'Password must be at least 8 characters'
		});
	}
	/*
	 If there is any error with password mismatch or size, then there must be
	 more than one error message in the errors array, hence its length must be more than one.
	 In that case, render register.handlebars with error messages.
	 */
	if (errors.length > 0) {
		res.render('rider/rideregister', {
			errors: errors,
			firstname,
			lastname,
			username,
			password,
			password2,
			gender,
			email,
			phoneno,
            transport,
            licenseno,
			usertype
		});
	} else {
		User.findOne({ where: { username: req.body.username } })
			.then(Rider => {
				if (Rider) {
					res.render('rider/rideregister', {
						error: User.username + 'already registered',
						firstname,
						lastname,
						username,
						password,
						password2,
						gender,
						email,
						phoneno,
                        transport,
                        licenseno,
						usertype
					});
				} else {
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(password, salt, (err, hash) => {
							if (err) throw err;
							password = hash;
							User.create({ firstname, lastname, username, password, gender, email, phoneno, transport, licenseno,usertype:'rider' })
								.then(user => {
									alertMessage(res, 'success', user.username + ' Please proceed to login', 'fas fa-sign-in-alt', true);
									res.redirect('rideregcomplete');
								})
								.catch(err => console.log(err));
						})
					});
				}
			});
		// alertMessage(res, 'success', `${req.body.email} registered successfully`, 'fas fa-check-circle', true);
		// rnodes.redirect('/customer/custregcomplete');
	}
});

// customer: account page 
router.get('/rideraccount/:id', ensureAuthenticated,(req, res) => {
	User.findOne({
		where: {
			id: req.params.id
		},
		raw: true
	}).then((Rider) => {
		console.log(Rider);
		if (req.params.id === Rider.id) {
			res.render('rider/rideraccount/', { 
				User: Rider
			});
		} else {
			alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
			res.redirect('/logout');
			// sth wrong here with the res.redirect 
		}
	}).catch(err => console.log(err));

	// alertMessage(res, 'success',
	// 	'You have updated your account details successfully!', 'fas fa-sign-in-alt', true);
	// alertMessage(res, 'danger',
	// 	'Something went wrong. Please try again! ', 'fas fa-exclamation-circle', false);
	// alertMessage(res, 'success',
	// 	'You have updated your password successfully!', 'fas fa-sign-in-alt', true);
	// let error_msg = 'Your passwords do not match please try again later!';
});

router.put('/rideraccount/:id', ensureAuthenticated, (req, res) => {
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let password = req.body.password;
	let email = req.body.email;
	let phoneno = req.body.phoneno;
    let transport = req.body.transport; 
	// console.log(firstname);

	User.update({
		firstname,
		lastname,
		password,
		email,
		phoneno,
        transport
	}, {
		where: {
			id: req.params.id
		}
	}).then(() => {
		// get value from customeraccount
		alertMessage(res, 'success','Account has been updated successfully!', 'fas fa-sign-in-alt', true);
		res.redirect('/rider/rideraccount/'+req.params.id);
	}).catch(err => console.log(err));
});
// req.params is where u pass in the variables into the URL 


module.exports = router;