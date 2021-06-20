// /customer/___________

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

// customer: login page 
// router.get('custlogin', (req, res) => {
// 	res.render('customer/custlogin', {title: "Login"});
// });

// Customer Home Page
router.get('/', (req, res) => {
	const title = 'TailorNow Home';
	res.render('homecust', { title: title, user: req.user });
});

router.get('/custlogin', (req, res) => {
	res.render('customer/custlogin')
});

router.post('/login', (req, res, next) => {
	
	passport.authenticate('local', {
		successRedirect: onSuccess(res),
		failureRedirect: '../customer/custlogin', // Route to /login URL
		failureFlash: 'Invalid username or password.',
		userProperty: res.user
	})
		(req, res, next);
});

function onSuccess(res){
	return '/customer';
}

// customer: register
router.get('/custregister', (req, res) => {
	res.render('customer/custregister');
});

// customer: registercomplete
router.get('/custregcomplete', (req, res) => {
	res.render('customer/custregcomplete');
});

// customer: register 
// havent add in validation for registration 
// add the account type for the various users 
router.post('/custregister', (req, res) => {
	let errors = [];
	let { firstname, lastname, username, password, password2, address1, address2, city, postalcode, gender, email, phoneno, usertype } = req.body;

	// All this are your variables
	console.log(req.body.firstname,
		req.body.lastname,
		req.body.username,
		req.body.password,
		req.body.password2,
		req.body.address1,
		req.body.address2,
		req.body.city,
		req.body.postalcode,
		req.body.gender,
		req.body.email,
		req.body.phoneno,
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
		res.render('customer/custregister', {
			errors: errors,
			firstname,
			lastname,
			username,
			password,
			password2,
			address1,
			address2,
			city,
			postalcode,
			gender,
			email,
			phoneno,
			usertype
		});
	} else {
		User.findOne({ where: { username: req.body.username } })
			.then(Customer => {
				if (Customer) {
					res.render('customer/custregister', {
						error: User.username + 'already registered',
						firstname,
						lastname,
						username,
						password,
						password2,
						address1,
						address2,
						city,
						postalcode,
						gender,
						email,
						phoneno,
						usertype
					});
				} else {
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(password, salt, (err, hash) => {
							if (err) throw err;
							password = hash;
							User.create({ firstname, lastname, username, password, address1, address2, city, postalcode, gender, email, phoneno, usertype: 'customer' })
								.then(user => {
									alertMessage(res, 'success', user.username + ' Please proceed to login', 'fas fa-sign-in-alt', true);
									res.redirect('custregcomplete');
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
router.get('/custaccount/:id', ensureAuthenticated, (req, res) => {
	User.findOne({
		where: {
			id: req.params.id
		},
		raw: true
	}).then((Customer) => {
		console.log(Customer);
		if (req.params.id === Customer.id) {
			res.render('customer/custacct', {
				User: Customer
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

router.put('/custaccount/:id', ensureAuthenticated, (req, res) => {
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let address1 = req.body.address1;
	let address2 = req.body.address2;
	let city = req.body.city;
	let postalcode = req.body.postalcode;
	let password = req.body.password;
	let email = req.body.email;
	let phoneno = req.body.phoneno;
	// console.log(firstname);

	User.update({
		firstname,
		lastname,
		address1,
		address2,
		city,
		postalcode,
		password,
		email,
		phoneno
	}, {
		where: {
			id: req.params.id
		}
	}).then(() => {
		// get value from customeraccount
		alertMessage(res, 'success', 'Account has been updated successfully!', 'fas fa-sign-in-alt', true);
		res.redirect('/customer/custaccount/' + req.params.id);
	}).catch(err => console.log(err));
});
// req.params is where u pass in the variables into the URL 



module.exports = router;