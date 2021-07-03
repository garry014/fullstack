// /customer/___________

// DB Table Connections
const Catalouge = require('../models/Catalouge');
const Review = require('../models/Review');
const User = require('../models/User');
const Deal = require('../models/Deal');

// Handlebars Helpers
const alertMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth');

// Other Requires
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var nodemailer = require('nodemailer');
const JWT_SECRET = 'secret super'
const jwt = require('jsonwebtoken');
const e = require('connect-flash');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const validator = require("email-validator");
const Regex = require("regex");

// customer: login page 
// router.get('custlogin', (req, res) => {
// 	res.render('customer/custlogin', {title: "Login"});
// });

function getToday() {
	// Get Date
	var currentdate = new Date();
	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var datetime = currentdate.getDate() + " "
		+ monthNames[currentdate.getMonth()] + " "
		+ currentdate.getFullYear() + " "
		+ currentdate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	return datetime;
}

// Customer Home Page
router.get('/homecust', (req, res) => {
	const title = 'TailorNow Home';
	res.render('homecust', { title: title, user: req.user });
});

router.get('/custlogin', (req, res) => {
	res.render('customer/custlogin')
});

router.post('/login', (req, res, next) => {

	passport.authenticate('local', {
		successRedirect: '../customer/homecust',
		failureRedirect: '../customer/custlogin', // Route to /login URL
		failureFlash: 'Invalid username or password.',
		userProperty: res.user
	})
		(req, res, next);
});


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
	// Minimum eight characters with at least one uppercase letter, one lowercase letter, one number and one special character
	const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


	// Checks if both passwords entered are the same
	if (req.body.password !== req.body.password2) {
		errors.push({
			msg: 'Passwords do not match.'
		});
	}
	// Checks that password length is more than 8 
	if (req.body.password.length < 8) {
		errors.push({
			msg: 'Password must be at least 8 characters.'
		});
	}
	// validation for email
	if (validator.validate(req.body.email) == false) {
		errors.push({
			msg: 'Please enter valid email.'
		});
	}
	// validation for password 
	if (regex.test(req.body.password) == false) {
		errors.push({
			msg: 'Password must contain at least eight characters with at least one uppercase letter, one lowercase letter, one number and one special character.'
		});
	}
	//validation for phone no.
	if (! /^[0-9]{8}$/.test(req.body.phoneno)) {
		errors.push({
			msg: 'Phone Number have to consist of 8 digits.'
		});
	}
	//validation for postalcode
	if (! /^[0-9]{6}$/.test(req.body.postalcode)) {
		errors.push({
			msg: 'Postal Code have to consist of 6 digits.'
		});
	}


	// Image Validation
	if (!req.files && req.files.file.mimetype.startsWith("image") == false) {
		errors.push({ msg: 'Please upload a valid image file.' });
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
		User.findOne({ where: { username: req.body.username, email: req.body.email, usertype: 'customer' } })
			.then(Customer => {
				if (Customer) {
					res.render('customer/custregister', {
						error: 'User has already registered or email has been used.',
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
					// Image Upload
					var file = req.files.file;
					var filename = file.name;
					var filetype = file.mimetype.substring(6);
					const newid = uuidv4(); // Generate unique file id

					var newFileName = newid + '.' + filetype;
					if (fs.existsSync(newFileName)) {
						fs.unlinkSync(newFileName);
					}

					file.mv('./public/uploads/user/' + filename, function (err) {
						if (err) {
							res.send(err);
						}
						else {
							fs.rename('./public/uploads/user/' + filename, './public/uploads/user/' + newFileName, function (err) {
								if (err) console.log('ERROR: ' + err);
							});
						}
					});

					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(password, salt, (err, hash) => {
							if (err) throw err;
							password = hash;
							User.create({ firstname, lastname, username, password, address1, address2, city, postalcode, gender, email, phoneno, photo: newFileName, usertype: 'customer' })
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
			// Compare using passport authentications instead of the usual id.params
			id: res.locals.user.id
		},
		raw: true
	}).then((Customer) => {
		// console.log(Customer);
		// customerLength = Object.keys(Customer).length;
		// const newObj = customerLength || undefined;
		// newObj = Object.keys(Customer).length;
		// console.log(Customer);
		if (!Customer) {
			alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
			req.logout();
			res.redirect('/customer/homecust');

		}
		else {
			if (req.params.id == Customer.id) {
				res.render('customer/custacct', {
					User: Customer,
				});
			}
			else {
				alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
				req.logout();
				res.redirect('/customer/homecust');
			}
		}

	}).catch(err => console.log(err));

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
		res.redirect('../customer/custaccount/' + req.params.id);
	}).catch(err => console.log(err));
});
// req.params is where u pass in the variables into the URL 

router.get('/forgetpassword', (req, res, next) => {
	res.render('customer/cforgetpassword')
});

router.post('/forgetpassword', (req, res, next) => {
	// CHECK IF EMAIL IS REGISTERED IN THE DATABASE 
	const { email } = req.body;
	User.findOne({
		where: {
			email: email,
			usertype: 'customer'
		},
		raw: true
	}).then((user) => {
		console.log(user);
		if (!user) {
			res.redirect('../customer/cinvalid');
			return;
		}
		console.log('password-->', user.password);
		const secret = JWT_SECRET + user.password
		const payload = {
			email: user.email,
			id: user.id
		}
		const token = jwt.sign(payload, secret, { expiresIn: '15m' });
		const link = `http://localhost:5000/customer/resetpassword/${user.id}/${token}`;
		console.log('\n\n' + link + '\n\n');
		res.redirect('../customer/creset');
	}).catch(err => console.log(err));
});

router.get('/cinvalid', (req, res) => {
	res.render('customer/cinvalidemail');
});

router.get('/creset', (req, res, next) => {
	res.render('customer/cresetlink')
});

router.get('cpwsuccess', (req, res, next) => {
	res.render('customer/cpwsuccess')
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
			res.render('customer/cresetpassword', { email: user.email })
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
					.then(Customer => {
						if (Customer) {
							res.render('customer/cresetpassword', {
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
										res.render('customer/cpwsuccess')
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
router.get('/clogoutsuccess', (req, res) => {
	res.render('customer/csucclogout');
});

router.get('/clogout', (req, res) => {
	req.logout();
	res.redirect('../customer/clogoutsuccess');
});


// Review - GET
router.get('/review/:id', ensureAuthenticated, (req, res) => {
	Catalouge.findOne({
		where: {
			id: req.params.id
		},
		raw: true
	})
		.then((pdetails) => {
			if (pdetails) {
				res.render('customer/review', {
					title: "Leave a review",
					id: req.params.id,
					pdetails: pdetails
				});
			}
			else {
				res.redirect('/404');
			}
		})
});

// Review - POST
router.post('/review/:id', ensureAuthenticated, (req, res) => {
	let errors = [];
	let { stars, review, storename } = req.body;

	if (stars == "") {
		errors.push({ msg: 'Please select a rating.' });
	}

	if (errors.length == 0) {
		// Image Upload
		var newFileName = "";
		if (req.files) {
			var file = req.files.file;
			var filename = file.name;
			var filetype = file.mimetype.substring(6);
			const newid = uuidv4(); // Generate unique file id

			newFileName = newid + '.' + filetype;
			if (fs.existsSync(newFileName)) {
				fs.unlinkSync(newFileName);
			}

			file.mv('./public/uploads/review/' + filename, function (err) {
				if (err) {
					res.send(err);
				}
				else {
					fs.rename('./public/uploads/review/' + filename, './public/uploads/review/' + newFileName, function (err) {
						if (err) console.log('ERROR: ' + err);
					});
				}
			});
		}

		Review.create({
			username: req.user.username,
			storename: storename,
			photo: newFileName,
			review: review,
			stars: stars,
			timestamp: getToday(),
			productid: req.params.id
		}).then(() => {
			res.redirect('/view/' + req.params.id);
		})
			.catch(err => {
				console.error('Unable to connect to the database:', err);
			});
	}

});

// Update Review - GET
router.get('/updatereview/:itemid/:id', ensureAuthenticated, (req, res) => {
	Catalouge.findOne({
		where: {
			id: req.params.itemid
		},
		raw: true
	})
		.then((pdetails) => {
			Review.findOne({
				where: {
					id: req.params.id
				},
				raw: true
			})
				.then((review) => {
					if (review) {
						res.render('customer/editreview', {
							title: "Update review",
							itemid: req.params.itemid,
							id: req.params.id,
							pdetails: pdetails,
							review: review
						});
					}
					else {
						res.redirect('/404');
					}
				})
		})
});


// Update Review - PUT
router.put('/updatereview/:itemid/:id', ensureAuthenticated, (req, res) => {
	let errors = [];
	let { stars, review } = req.body;

	if (stars == "") {
		errors.push({ msg: 'Please select a rating.' });
	}

	if (errors.length == 0) {
		// Image Upload
		Review.findOne({
			where: {
				id: req.params.id
			},
			raw: true
		})
			.then((reviews) => {
				var imageLink = reviews.photo;
				if (req.files) {
					fs.unlink("./public/uploads/review/" + imageLink, (err) => {
						if (err) {
							console.log("failed to delete local image:" + err);
						} else {
							console.log('successfully deleted local image');
						}
					});

					var file = req.files.file;
					var filename = file.name;
					var filetype = file.mimetype.substring(6);
					const newid = uuidv4(); // Generate unique file id

					imageLink = newid + '.' + filetype;
					if (fs.existsSync(imageLink)) {
						fs.unlinkSync(imageLink);
					}

					file.mv('./public/uploads/review/' + filename, function (err) {
						if (err) {
							res.send(err);
						}
						else {
							fs.rename('./public/uploads/review/' + filename, './public/uploads/review/' + imageLink, function (err) {
								if (err) console.log('ERROR: ' + err);
							});
						}
					});
				}

				Review.update({
					photo: imageLink,
					review: review,
					stars: stars,
					timestamp: getToday()
				}, {
					where: { id: req.params.id }
				})
					.catch(err => console.log(err));
				alertMessage(res, 'info', 'Successfully updated review.', 'far fa-laugh-wink', true);
				res.redirect('/view/' + req.params.itemid);
			})
	}
});

// Delete Review
router.get('/deletereview/:itemid/:id', ensureAuthenticated, (req, res) => {
	Review.findOne({
		where: {
			id: req.params.id
		},
		raw: true
	})
		.then((reviews) => {
			if (reviews) {
				fs.unlink("./public/uploads/review/" + reviews.photo, (err) => {
					if (err) {
						console.log("failed to delete local image:" + err);
					} else {
						console.log('successfully deleted local image');
					}
				});

				Review.destroy({
					where: {
						id: req.params.id
					}
				})
					.then(() => {
						alertMessage(res, 'info', 'Successfully deleted review.', 'far fa-trash-alt', true);
						res.redirect('/view/' + req.params.itemid);
					})
			}
			else {
				res.redirect('/404');
			}

		})
})

//kaijie
// customer: flash deals
router.get('/flashdeals', (req, res) => {
	Deal.findAll({
        where: {
        },
        order: [
            ['pname', 'ASC']
        ],
        raw: true,
    })
        .then((deals) => {
            res.render('customer/flashdeals', {
		title: "Flash Deals",
                deals : deals
            });
        })
        .catch(err => console.log(err));
});

module.exports = router;
