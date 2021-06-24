// Redirections/Form submit/hyperlink links /tailor/___________
// But the links here, put /________ directly
const express = require('express');
const router = express.Router();
var validator = require('validator');
const alertMessage = require('../helpers/messenger');
var bodyParser = require('body-parser');
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');
const User = require('../models/User');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');
const JWT_SECRET = 'secret super'
const jwt = require('jsonwebtoken');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

function isNumeric(value) {
	return /^\d+$/.test(value);
}

router.get('/hometailor', (req, res) => {
	res.render('tailor/hometailor');
});

router.get('/addproduct', ensureAuthenticated, (req, res) => {
	res.render('tailor/addproduct', { title: "Add product" });
});

// Add Product - POST
router.post('/addproduct', ensureAuthenticated, urlencodedParser, (req, res) => {
	let errors = [];
	let { name, price, discount, description, question, q1category } = req.body;

	// Validation
	// if (name.length < 3) { 
	// 	errors.push({ msg: 'Name should be at least 3 character.' });
	// }
	if (isNumeric(price) == false) {
		errors.push({ msg: 'Please enter a valid number between 0 to 2000.' });
	}
	else if (price > 2000) {
		errors.push({ msg: 'Please enter a valid number between 0 to 2000.' });
	}
	if (isNumeric(discount) == false) {
		errors.push({ msg: 'Please enter a valid number between 0 to 100.' });
	}
	else if (discount > 100) {
		errors.push({ msg: 'Please enter a valid number between 0 to 100.' });
	}
	if (question != "") {
		if (q1category == "") {
			errors.push({ msg: 'Please select the category, either a textbox or dropdown menu.' });
		}
	}
	// Image Validation
	if (!req.files) {
		errors.push({ msg: 'Please upload an image file.' });
	}
	else if (req.files.file.mimetype.startsWith("image") == false) {
		errors.push({ msg: 'Please upload a valid image file.' });
	}

	var q1choices_array = [];
	if (q1category == "radiobtn") {
		var fieldNum = parseInt(req.body.fieldNum);
		if (fieldNum >= 1) {
			for (i = 0; i < fieldNum; i++) {
				if (req.body["flist" + i] == "") {
					var a = i + 1;
					errors.push({ msg: 'Dropdown menu choice ' + a + ' cannot be empty, please remove, or fill in the box.' });
				}
				else {
					q1choices_array.push(req.body["flist" + i]);
				}
			}
		}
		else {
			errors.push({ msg: 'Please ensure your dropdown menu has 1 or more choices.' });
		}
	}


	if (errors.length == 0) {
		// Image Upload
		var file = req.files.file;
		var filename = file.name;
		var filetype = file.mimetype.substring(6);
		const newid = uuidv4(); // Generate unique file id

		Catalouge
			.create({
				storename: 'Ah Tong Tailor',
				name: name,
				price: price,
				image: newid + '.' + filetype,
				description: description,
				discount: discount,
				customqn: question,
				customcat: q1category
			})
			.then(result => {
				let cataid = result.id;
				if (q1category == "radiobtn") {
					q1choices_array.forEach(c => {
						console.log("here:" + cataid);
						Productchoices.create({
							choice: c,
							catalougeId: cataid
						})
							.catch(err => {
								console.error('Unable to connect to the database:', err);
							});
					})
				}

				// Image Upload
				var newFileName = './public/uploads/products/' + newid + '.' + filetype;
				if (fs.existsSync(newFileName)) {
					fs.unlinkSync(newFileName);
				}

				file.mv('./public/uploads/products/' + filename, function (err) {
					if (err) {
						res.send(err);
					}
					else {
						fs.rename('./public/uploads/products/' + filename, newFileName, function (err) {
							if (err) console.log('ERROR: ' + err);
						});
						res.redirect('/view/' + result.id);
					}
				});
			})
			.catch(err => {
				console.error('Unable to connect to the database:', err);
			});
	}
	else {
		//return error msg
		res.render('tailor/addproduct', {
			title: "Add product",
			errors: errors,
			name: req.body.name,
			price: req.body.price,
			discount: req.body.discount,
			description: req.body.description,
			q1: req.body.question,
			q1category: req.body.q1category
		});
	}
});

// Update Product - GET
router.get('/editproduct/:id', (req, res) => {
	Catalouge.findOne({
		where: { id: req.params.id },
		raw: true
	})
		.then(pdetails => {
			console.log(pdetails);
			if (pdetails) {
				if (pdetails.customcat == "radiobtn") {
					Productchoices.findAll({
						where: { catalougeId: req.params.id },
						raw: true
					})
						.then(pchoices => {
							res.render('tailor/editproduct', {
								title: "Update product",
								pdetails: pdetails,
								pchoices: pchoices
							});
						})
						.catch(err => {
							console.error('Unable to connect to the database:', err);
						});

				}
				else {
					res.render('tailor/editproduct', {
						title: "Update product",
						pdetails: pdetails
					});
				}
			}
			else {
				return res.redirect('/404');
			}
		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});
});

// Update Product - PUT
router.put('/editproduct/:id', urlencodedParser, (req, res) => {
	let errors = [];
	let { name, price, discount, description, question, q1category, imageLink } = req.body;

	// Validation
	if (isNumeric(price) == false) {
		errors.push({ msg: 'Please enter a valid number between 0 to 2000.' });
	}
	else if (price > 2000) {
		errors.push({ msg: 'Please enter a valid number between 0 to 2000.' });
	}
	if (isNumeric(discount) == false) {
		errors.push({ msg: 'Please enter a valid number between 0 to 100.' });
	}
	else if (discount > 100) {
		errors.push({ msg: 'Please enter a valid number between 0 to 100.' });
	}
	if (question != "") {
		if (q1category == "") {
			errors.push({ msg: 'Please select the category, either a textbox or dropdown menu.' });
		}
	}

	var q1choices_array = [];
	console.log(q1choices_array);
	if (q1category == "radiobtn") {
		var fieldNum = parseInt(req.body.fieldNum);
		if (fieldNum >= 1) {
			for (i = 0; i < fieldNum; i++) {
				if (req.body["flist" + i] != "") {
					var flist = req.body["flist" + i];
					console.log(flist);
					q1choices_array.push(flist);
				}
				else {
					var a = i + 1;
					errors.push({ msg: 'Dropdown menu choice ' + a + ' cannot be empty, please remove, or fill in the box.' });
				}
				console.log(q1choices_array);
			}
		}
		else {
			errors.push({ msg: 'Please ensure your dropdown menu has 1 or more choices.' });
		}
	}

	if (q1category == "radiobtn") {
		// delete every productchoices so it won't conflict later
		Productchoices.findAll({
			where: {
				catalougeId: req.params.id
			}
		})
			.then((choices) => {
				if (choices != null) {
					Productchoices.destroy({
						where: {
							catalougeId: req.params.id
						}
					})
						.then(() => {
							q1choices_array.forEach(c => {
								Productchoices.create({
									choice: c,
									catalougeId: req.params.id
								})
									.then(() => {
										console.log("Product choice saved");
									})
									.catch(err => {
										console.error('Unable to connect to the database:', err);
									});
							});
						});
				}
				else {
					q1choices_array.forEach(c => {
						Productchoices.create({
							choice: c,
							catalougeId: req.params.id
						})
							.then(() => {
								console.log("Product choice saved");
							})
							.catch(err => {
								console.error('Unable to connect to the database:', err);
							});
					});
				}
			});
	}

	if (errors.length == 0) {
		// Image Upload
		var newid = imageLink;
		if (req.files) {
			var file = req.files.file;
			var filename = file.name;
			var filetype = file.mimetype.substring(6);
			newid = uuidv4().concat(".").concat(filetype); // Generate unique file id

			// Image Upload
			var newFileName = newid;
			console.log("./public/uploads/products/"+imageLink);
			fs.unlink("./public/uploads/products/"+imageLink, (err) => {
				if (err) {
					console.log("failed to delete local image:"+err);
				} else {
					console.log('successfully deleted local image');                                
				}
			});
			file.mv('./public/uploads/products/' + filename, function (err) {
				if (err) {
					res.send(err);
				}
				else{
					fs.rename('./public/uploads/products/' + filename, './public/uploads/products/' + newFileName, function (err) {
						if (err) console.log('ERROR: ' + err);
					});
				}
			});
		}

		Catalouge.update({
			storename: 'Ah Tong Tailor',
			name: name,
			price: price,
			image: newid,
			description: description,
			discount: discount,
			customqn: question,
			customcat: q1category
		}, {
			where: {
				id: req.params.id
			}
		}).then(() => {

			if (req.files) {
				
				// Page gets changed overly fast, such that page is loaded before img changes are made
			}
			alertMessage(res, 'success', 'Updated product successfully!', 'fas fa-check-circle', true);
			res.redirect('/view/' + req.params.id);
		})
			.catch(err => console.log(err));


	}
	else {
		//return error msg
		errors.forEach(error => {
			alertMessage(res, 'danger', error.msg, 'fas fa-exclamation-triangle', true);
		});
		res.redirect('/tailor/editproduct/' + req.params.id);
	}
});

router.get('/deleteProduct/:id', (req, res) => {
	Catalouge.findOne({
		where: {
			id: req.params.id
		}
	}).then((pdetails) => {
		if (pdetails != null) {
			if (pdetails.customcat == "radiobtn") {
				Productchoices.destroy({
					where: {
						catalougeId: req.params.id
					}
				});
			}
			fs.unlink("./public/uploads/products/"+pdetails.image, (err) => {
				if (err) {
					console.log("failed to delete local image:"+err);
				} else {
					console.log('successfully deleted local image');                                
				}
			});
			Catalouge.destroy({
				where: {
					id: req.params.id
				}
			})
				.then((pDetails) => {
					alertMessage(res, 'info', 'Successfully deleted item.', 'far fa-trash-alt', true);
					res.redirect('/viewshops/' + pdetails.storename);
				})
		};
	})
})

router.get('/tailorlogin', (req, res) => {
	res.render('tailor/tailorlogin')
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: onSuccess(res),
		failureRedirect: '../tailor/tailorlogin', // Route to /login URL
		failureFlash: 'Invalid username or password.',
		userProperty: res.user
	})
	(req, res, next);
});

function onSuccess(response){
	return '../tailor/hometailor'
}

// tailor: registration complete page 
router.get('/tailoregcomplete', (req, res) => {
	res.render('tailor/tailoregcomplete');
});

// tailor: register page 
router.get('/tailoregister', (req, res) => {
	res.render('tailor/tailoregister');
});

router.post('/tailoregister', (req, res) => {
	let errors = [];
	let { shopname, username, password, password2, address1, address2, city, postalcode, email, phoneno, usertype } = req.body;

	// All this are your variables
	console.log(req.body.shopname,
		req.body.username,
		req.body.password,
		req.body.password2,
		req.body.address1,
		req.body.address2,
		req.body.city,
		req.body.postalcode,
		req.body.email,
		req.body.phoneno,
		req.body.usertype='tailor'
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
	// same email + same username + within the same usertype cannot register
	if (errors.length > 0) {
		res.render('tailor/tailoregister', {
			errors: errors,
			shopname,
			username,
			password,
			password2,
			address1,
			address2,
			city,
			postalcode,
			email,
			phoneno,
			usertype
		});
	} else {
		User.findOne({ where: { username: req.body.username, email: req.body.email, usertype: req.body.usertype } })
			.then(Tailor => {
				if (Tailor) {
					res.render('tailor/tailoregister', {
						error: 'User has already registered or email has been used.',
						username,
						password,
						password2,
						shopname,
						address1,
						address2,
						city,
						postalcode,
						email,
						phoneno,
						usertype
					});
				} else {
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(password, salt, (err, hash) => {
							if (err) throw err;
							password = hash;
							User.create({ shopname, username, password, address1, address2, city, postalcode, email, phoneno,usertype:'tailor' })
								.then(user => {
									alertMessage(res, 'success', user.username + ' Please proceed to login', 'fas fa-sign-in-alt', true);
									res.redirect('tailoregcomplete');
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

// tailor: account page 
router.get('/tailoraccount/:id', ensureAuthenticated,(req, res) => {
	User.findOne({
		where: {
			id: req.params.id
		},
		raw: true
	}).then((Tailor) => {
		console.log(Tailor);
		if (req.params.id === Tailor.id) {
			res.render('tailor/tailoracct', { 
				User: Tailor
			});
		} else {
			alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
			res.redirect('/tlogout');
			// sth wrong here with the res.redirect 
		}
	}).catch(err => console.log(err));
});

router.put('/tailoraccount/:id', ensureAuthenticated, (req, res) => {
	let address1 = req.body.address1;
	let address2 = req.body.address2;
	let city = req.body.city;
	let postalcode = req.body.postalcode;
	let shopname = req.body.shopname;
	let password = req.body.password;
	let email = req.body.email;
	let phoneno = req.body.phoneno;

	User.update({
		address1,
		address2,
		city,
		postalcode,
		shopname,
		password,
		email,
		phoneno
	}, {
		where: {
			id: req.params.id
		}
	}).then(() => {
		alertMessage(res, 'success','Account has been updated successfully!', 'fas fa-sign-in-alt', true);
		res.redirect('/tailor/tailoraccount/'+req.params.id);
	}).catch(err => console.log(err));
});

router.get('/forgetpassword', (req, res, next) => {
	res.render('tailor/tforgetpassword')
});

router.post('/forgetpassword', (req, res, next) => {
	// CHECK IF EMAIL IS REGISTERED IN THE DATABASE 
	const { email } = req.body;
	User.findOne({
		where: {
			email: email,
			usertype: 'tailor'
		},
		raw: true
	}).then((user) => {
		console.log(user);
		if (!user) {
			res.redirect('../tailor/tinvalid');
			return;
		}
		console.log('password-->', user.password);
		const secret = JWT_SECRET + user.password
		const payload = {
			email: user.email,
			id: user.id
		}
		const token = jwt.sign(payload, secret, { expiresIn: '15m' });
		const link = `http://localhost:5000/tailor/resetpassword/${user.id}/${token}`;
		console.log('\n\n' + link + '\n\n');
		res.redirect('../tailor/treset');
	}).catch(err => console.log(err));
});

router.get('/tinvalid', (req, res) => {
	res.render('tailor/tinvalidemail');
});

router.get('/treset', (req, res, next) => {
	res.render('tailor/tresetlink')
});

router.get('tpwsuccess', (req, res, next) => {
	res.render('tailor/tpwsuccess')
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
			res.render('tailor/tresetpassword', { email: user.email })
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
				res.render('tailor/tresetpassword', {
					errors: errors,
					password,
					password2
				});
			}
			else {
				User.findOne({ where: { id: id, password: password } })
					.then(Tailor => {
						if (Tailor) {
							res.render('tailor/tresetpassword', {
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
										res.render('tailor/tpwsuccess')
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

router.get('/tlogoutsuccess', (req, res) => {
	res.render('tailor/tsucclogout');
});

router.get('/tlogout', (req, res) => {
	req.logout();
	res.redirect('../tailor/tlogoutsuccess');
});

module.exports = router;