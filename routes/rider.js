// /rider/___________

// DB Table Connections
const User = require('../models/User');

// Handlebars Helpers
const alertMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth');

// Other Requires
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const JWT_SECRET = 'secret super'
const jwt = require('jsonwebtoken');


// riders: home page 
router.get('/homerider', (req, res) => {
	res.render('rider/homerider', { path: "rider" });
});

// riders: login page 
router.get('/riderlogin', (req, res) => {
	res.render('rider/riderlogin');
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '../rider/homerider',
		failureRedirect: '../rider/riderlogin', // Route to /login URL
		failureFlash: 'Invalid username or password.',
		userProperty: res.user
	})
		(req, res, next);
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
	let { firstname, lastname, username, password, password2, gender, email, phoneno, transport, licenseno, usertype } = req.body;

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
		req.body.usertype = 'rider'
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
		User.findOne({ where: { username: req.body.username, email: req.body.email, usertype: req.body.usertype } })
			.then(Rider => {
				if (Rider) {
					res.render('rider/rideregister', {
						error: 'User has already registered or email has been used.',
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
							User.create({ firstname, lastname, username, password, gender, email, phoneno, transport, licenseno, usertype: 'rider' })
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
router.get('/rideraccount/:id', ensureAuthenticated, (req, res) => {
	User.findOne({
		where: {
			id: res.locals.user.id
		},
		raw: true
	}).then((Rider) => {
		if (!Rider) {
			alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
			req.logout();
			res.redirect('/rider/homerider');

		}
		else {
			if (req.params.id == Rider.id) {
				res.render('rider/rideracct', {
					User: Rider,
				});
			}
			else {
				alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
				req.logout();
				res.redirect('/rider/homerider');
			}
		}

	}).catch(err => console.log(err));

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
		alertMessage(res, 'success', 'Account has been updated successfully!', 'fas fa-sign-in-alt', true);
		res.redirect('/rider/rideraccount/' + req.params.id);
	}).catch(err => console.log(err));
});
// req.params is where u pass in the variables into the URL 

router.get('/forgetpassword', (req, res, next) => {
	res.render('rider/rforgetpassword')
});

router.post('/forgetpassword', (req, res, next) => {
	// CHECK IF EMAIL IS REGISTERED IN THE DATABASE 
	const { email } = req.body;
	User.findOne({
		where: {
			email: email,
			usertype: 'rider'
		},
		raw: true
	}).then((user) => {
		console.log(user);
		if (!user) {
			res.redirect('../rider/rinvalid');
			return;
		}
		console.log('password-->', user.password);
		const secret = JWT_SECRET + user.password
		const payload = {
			email: user.email,
			id: user.id
		}
		const token = jwt.sign(payload, secret, { expiresIn: '15m' });
		const link = `http://localhost:5000/rider/resetpassword/${user.id}/${token}`;
		console.log('\n\n' + link + '\n\n');
		res.redirect('../rider/rreset');
	}).catch(err => console.log(err));
});

router.get('/rinvalid', (req, res) => {
	res.render('rider/rinvalidemail');
});

router.get('/rreset', (req, res, next) => {
	res.render('rider/rresetlink')
});

router.get('rpwsuccess', (req, res, next) => {
	res.render('rider/rpwsuccess')
});

router.get('/resetpassword/:id/:token', (req, res, next) => {
	const { id, token } = req.params
	console.log(id, token)

	User.findOne({
		where: {
			id: id
		},
		raw: true
	}).then((user) => {
		// check if this id exist in database 
		if (!user) {
			res.send('Invalid id')
			return
		}
		//valid id, and we have a valid user with this id 
		console.log('reset password-->', user.password);
		const secret = JWT_SECRET + user.password
		try {
			const payload = jwt.verify(token, secret)
			console.log('jwt--->', payload);
			res.render('rider/rresetpassword', { email: user.email })
		} catch (error) {
			console.log(error.message);
			res.send(error.message);

		}
	}).catch(err => console.log(err));

});

router.post('/resetpassword/:id/:token', (req, res, next) => {
	const { id, token } = req.params;
	const { password, password2 } = req.body;
	User.findOne({
		where: {
			id: id
		},
		raw: true
	}).then((user) => {
		// check if this id exist in database 
		// if (!user) {
		// 	res.send('Invalid id')
		// 	return
		// }
		const secret = JWT_SECRET + user.password
		try {
			let errors = [];
			const payload = jwt.verify(token, secret);
			// Checks if both passwords entered are the same
			if (password !== password2) {
				console.log('match')
				errors.push({
					msg: 'Passwords do not match.'
				});
			}
			// Checks that password length is more than 8 (upgrade this to include checking for special characters etc)
			if (req.body.password.length < 8) {
				console.log('length')
				errors.push({
					msg: 'Passwords must at least have 8 characters.'
				});
			}
			if (errors.length > 0) {
				res.render('customer/cresetpassword', {
					errors: errors,
					password,
					password2
				});
			}
			else {
				User.findOne({ where: { id: id, password: password } })
					.then(Rider => {
						if (Rider) {
							res.render('rider/rresetpassword', {
								error: 'Old passwords cannot be used.',
								password,
								password2
							});
						} else {
							bcrypt.genSalt(10, (err, salt) => {
								bcrypt.hash(password, salt, (err, hash) => {
									if (err) throw err;
									let password = hash;
									User.update({
										password: password,
									}, {
										where: {
											id: id
										}
									}).then(() => {
										res.render('rider/rpwsuccess')
									}).catch(err => console.log(err));
									// validate password and password2 should match 
								})
							});
						}
					})
			}
		} catch (error) {
			console.log(error.message);
			res.send(error.message);

		}

	}).catch(err => console.log(err));

});

// logout user 
router.get('/rlogoutsuccess', (req, res) => {
	res.render('rider/rsucclogout', { title: "Flash Deals" });
});

router.get('/rlogout', (req, res) => {
	req.logout();
	res.redirect('../rider/rlogoutsuccess');
});
module.exports = router;