// Redirections/Form submit/hyperlink links /tailor/___________
// But the links here, put /________ directly

// DB Table Connections
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const Deal = require('../models/Deal');

// Handlebars Helpers
const alertMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth');

// Other Requires
const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/Course');
const Video = require('../models/Video');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const JWT_SECRET = 'secret super'
const jwt = require('jsonwebtoken');
const validator = require("email-validator");
const Regex = require("regex");

var urlencodedParser = bodyParser.urlencoded({ extended: false });

function isNumeric(value) {
	return /^\d+$/.test(value);
}

router.get('/hometailor', (req, res) => {
	res.render('tailor/hometailor');
});

router.get('/addproduct', ensureAuthenticated, (req, res) => {
	var user_status = "customer";
	if (typeof req.user != "undefined") {
		user_status = res.locals.user.usertype;
	}

	if (user_status == "tailor") {
		res.render('tailor/addproduct', { title: "Add product" });
	}
	else {
		alertMessage(res, 'danger', 'Unauthorised access! Register as a tailor to add product.', 'fas fa-exclamation-triangle', true);
		res.redirect('../hometailor');
	}
});

// Add Product - POST
router.post('/addproduct', ensureAuthenticated, urlencodedParser, (req, res) => {
	if (typeof req.user != "undefined") {
		var shopname = res.locals.user.shopname;
	}

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
				storename: shopname,
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
router.get('/editproduct/:id', ensureAuthenticated, (req, res) => {
	if (typeof req.user != "undefined") {
		var shopname = res.locals.user.shopname;
	}

	Catalouge.findOne({
		where: { id: req.params.id },
		raw: true
	})
		.then(pdetails => {
			if(pdetails){
				if (pdetails.storename != shopname) {
					alertMessage(res, 'danger', 'You shall not pass!', 'fas fa-exclamation-triangle', true);
					res.redirect('/viewshops');
				}
				else {
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
				}
			}
			else {
				alertMessage(res, 'danger', 'You have accessed an invalid link.', 'fas fa-exclamation-triangle', true);
				res.redirect('/viewshops');
			}

		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});
});

// Update Product - PUT
router.put('/editproduct/:id', ensureAuthenticated, urlencodedParser, (req, res) => {
	let errors = [];
	let { name, price, discount, description, question, q1category, imageLink } = req.body;

	if (typeof req.user != "undefined") {
		var shopname = res.locals.user.shopname;
	}

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
			console.log("./public/uploads/products/" + imageLink);
			fs.unlink("./public/uploads/products/" + imageLink, (err) => {
				if (err) {
					console.log("failed to delete local image:" + err);
				} else {
					console.log('successfully deleted local image');
				}
			});
			file.mv('./public/uploads/products/' + filename, function (err) {
				if (err) {
					res.send(err);
				}
				else {
					fs.rename('./public/uploads/products/' + filename, './public/uploads/products/' + newFileName, function (err) {
						if (err) console.log('ERROR: ' + err);
					});
				}
			});
		}

		Catalouge.update({
			storename: shopname,
			name: name,
			price: price,
			image: newid,
			description: description,
			discount: discount,
			customqn: question,
			customcat: q1category
		}, {
			where: {
				[Op.and]: [{ id: req.params.id }, { storename: shopname }]
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

router.get('/deleteProduct/:id', ensureAuthenticated, (req, res) => {
	if (typeof req.user != "undefined") {
		var shopname = res.locals.user.shopname;
	}
	Catalouge.findOne({
		where: {
			id: req.params.id
		}
	}).then((pdetails) => {
		if (pdetails != null && pdetails.storename == shopname) {
			if (pdetails.customcat == "radiobtn") {
				Productchoices.destroy({
					where: {
						catalougeId: req.params.id
					}
				});
			}
			fs.unlink("./public/uploads/products/" + pdetails.image, (err) => {
				if (err) {
					console.log("failed to delete local image:" + err);
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
					res.redirect('/viewshops/' + pdetails.storename + '/1');
				})
		}
		else {
			alertMessage(res, 'danger', 'Do you have a badge????', 'fas fa-exclamation-triangle', true);
			res.redirect('/viewshops/' + pdetails.storename + '/1');
		}
	})
});


// stacey

// tailor: create course
router.get('/createcourse', (req, res) => {
	res.render('tailor/createcourse', { title: "Create Course" });
});

router.post('/createcourse', (req, res) => {
	let title = req.body.title;
	let language = req.body.language;
	let day = req.body.day;
	let material = req.body.material;
	let description = req.body.description;
	let price = req.body.price;
	let thumbnail = req.body.thumbnail;


	console.log(title, language);

	if (req.files) {

		console.log(req.files);
		var file = req.files.thumbnail;
		var filename = file.name;
		console.log(filename);

		file.mv('./public/uploads/courseimg/' + filename, function (err) {
			if (err) {
				res.send(err);
			}
		});
	}

	// Multi-value components return array of strings or undefined
	Course.create({
		title: title,
		language: language,
		day: day,
		material: material,
		description: description,
		price: price,
		thumbnail: filename,
		user: 1
	}).then((course) => {
		res.redirect('/tailor/viewcourse/:user'); // redirect to call router.get(/listVideos...) to retrieve all updated
		// videos
	}).catch(err => console.log(err))
});



router.get('/viewcourse/:id', (req, res) => {
	Course.findAll({
		where: {
			user: 1 //ummmmmmmmmmmmmm
		},
		raw: true
	}).then((course) => {
		//console.log(course);
		res.render('tailor/viewcourse', { title: "View Course", course: course });
	}).catch(err => console.log(err));
});

//delete c
router.post('/deletecourse/:id', (req, res) => {
	//let courseId = req.params.id;
	//let userId = 1;
	//console.log(courseId) // Select * from videos where videos.id=videoID and videos.userId=userID
	Course.findOne({
		where: {
			id: req.params.id,
			user: 1
		},
		raw: true
		// attributes: ['id']
	}).then((course) => { // if record is found, user is owner of video
		if (course) {
			Course.destroy({
				where: {
					id: req.params.id
				}
			}).then(() => {
				alertMessage(res, 'info', 'course deleted', 'far fa-trash-alt', true);
				res.redirect('/tailor/viewcourse/1'); // To retrieve all videos again
			}).catch(err => console.log(err));
		} else {
			alertMessage(res, 'danger', 'Unauthorised access to course', 'fas fa-exclamation-circle', true);
			res.redirect('/tailor/viewcourse/1');
		}
	});
});

// tailor: update course
router.get('/updatecourse/:id', (req, res) => {
	Course.findOne({
		where: {
			id: req.params.id //ummmmmmmmmmmmmm
		},
		raw: true
	}).then((course) => {
		//console.log(course);
		res.render('tailor/updatecourse', { title: "Update Course", course: course });
	}).catch(err => console.log(err));
});


router.put('/updatecourse/:id', (req, res) => {   // id is course id
	let title = req.body.title;
	let language = req.body.language;
	let day = req.body.day;
	let material = req.body.material;
	let description = req.body.description;
	let price = req.body.price;
	let thumbnail = req.body.thumbnail;
	console.log(title);

	Course.update({
		title: title,
		language: language,
		day: day,
		material: material,
		description: description,
		price: price,
		thumbnail: thumbnail,
		user: 1
	}, {
		where: {
			id: req.params.id
		}
	}).then(() => {
		res.redirect('/tailor/viewcourse/1');
		// videos
	}).catch(err => console.log(err));
});




// tailor: add/delete/update course content

//display the title after adding NOT IT LOL. 
//somewhere, the ID is working correctly i suppose bc i tried to enter 10 and the page loads forever (theres no course id 10)
//view topics addded
router.get('/addcontent/:id', (req, res) => {
	Course.findOne({
		where: {
			id: req.params.id, //ummmmmmmmmmmmmm
			user: 1
		},
		raw: true
	}).then((course) => {
		//console.log(course.id); ////ok well these r the same unless it's in string or wtv,
		//console.log(req.params.id); // it's not going in the if and idk if that's rly needed
		Video.findAll({
			where: {
				courseid: req.params.id
			},
			raw: true
		})
			.then((videos) => {
				res.render('tailor/addcontent', {
					title: "Course Content",
					course: course,
					videos: videos,
					id: req.params.id
				});
			})
		//.then((videos)

		//);

	}).catch(err => console.log(err));
	//is delete supp to be here too???


});

//create topic
router.post('/addcontent/:id', (req, res) => {
	let topic = req.body.topic;
	let video = req.body.video;
	//let courseid = req.course.id //?????????? cannot
	//video not showing in sql but is storing??  whats ur prob.
	console.log(topic, video);

	if (req.files) {
		console.log(req.files);
		var file = req.files.video;
		var filename = file.name;
		console.log(filename);

		file.mv('./public/uploads/video/' + filename, function (err) {
			if (err) {
				res.send(err);
			}
		});
	}

	// Multi-value components return array of strings or undefined
	Video.create({
		topic: topic,
		video: filename,
		courseid: req.params.id
	}).then((videocontent) => {
		res.redirect('/tailor/addcontent/' + req.params.id); // redirect to call router.get(/listVideos...) to retrieve all updated
		// videos
	}).catch(err => console.log(err))
});

//delete topic, is it even going in here.
//put? post? not get? what?
router.get('/deletecontent/:courseid/:id', (req, res) => {
	Video.findOne({
		where: {
			id: req.params.id //id
			//user: 1
		}
		//raw:true 
	}).then((videos) => {

		console.log(videos)
		if (videos) {
			Video.destroy({
				where: {
					id: req.params.id
				}
			}).then(() => {
				alertMessage(res, 'info', 'topic deleted', 'far fa-trash-alt', true);
				res.redirect('/tailor/addcontent/' + req.params.courseid); // To retrieve all videos again
			}).catch(err => console.log(err));
		} else {
			alertMessage(res, 'danger', 'Unauthorised access to topic', 'fas fa-exclamation-circle', true);
			res.redirect('/tailor/addcontent/' + req.params.id);
		}
	});
});


// tailor: calendar schedule
router.get('/tailorschedule', (req, res) => {
	res.render('tailor/tailorschedule', { title: "Education Platform Content" });
});

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

function onSuccess(response) {
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
	const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
	// validation for email
	if (validator.validate(req.body.email) == false) {
		errors.push({
			msg: 'Please enter valid email.'
		});
	}

	if (regex.test(req.body.password) == false) {
		errors.push({
			msg: 'Password must contain at least eight characters with at least one uppercase letter, one lowercase letter, one number and one special character'
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


	/*
	 If there is any error with password mismatch or size, then there must be
	 more than one error message in the errors array, hence its length must be more than one.
	 In that case, render register.handlebars with error messages.
	 */
	// same email + same username + within the same usertype cannot register

	// Image Validation
	if (!req.files) {
		errors.push({ msg: 'Please upload an image file.' });
	}
	else if (req.files.file.mimetype.startsWith("image") == false) {
		errors.push({ msg: 'Please upload a valid image file.' });
	}

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
		User.findOne({ where: { username: req.body.username, email: req.body.email, usertype: 'tailor' } })
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
							User.create({ shopname, username, password, address1, address2, city, postalcode, email, phoneno,  photo: newFileName, usertype: 'tailor' })
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
router.get('/tailoraccount/:id', ensureAuthenticated, (req, res) => {
	User.findOne({
		where: {
			id: res.locals.user.id
		},
		raw: true
	}).then((Tailor) => {
		if (!Tailor) {
			alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
			req.logout();
			res.redirect('/tailor/hometailor');

		}
		else {
			if (req.params.id == Tailor.id) {
				res.render('tailor/tailoracct', {
					User: Tailor,
				});
			}
			else {
				alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
				req.logout();
				res.redirect('/tailor/hometailor');
			}
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
		alertMessage(res, 'success', 'Account has been updated successfully!', 'fas fa-sign-in-alt', true);
		res.redirect('/tailor/tailoraccount/' + req.params.id);
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

//kaijie
// tailor: view vouchers
router.get('/vouchers', ensureAuthenticated, (req, res) => {
    Voucher.findAll({
        where: {
        },
        order: [
            ['code', 'ASC']
        ],
        raw: true,
    })
        .then((vouchers) => {
            res.render('tailor/vouchers', {
				title: "Vouchers List",
                vouchers : vouchers
            });
        })
        .catch(err => console.log(err));
});

// tailor: add voucher
router.get('/addVoucher', ensureAuthenticated, (req, res) => {
	res.render('tailor/addvoucher', { title: "Add Voucher" });
});

router.post('/addVoucher', (req, res) => {
    let code = req.body.code;
    let description = req.body.description;
    let discount = req.body.discount;
    let minpurchase = req.body.minpurchase;
    let quantity = req.body.quantity;
	let vstartdate =  req.body.vstartdate;
    let vexpirydate =  req.body.vexpirydate;

    Voucher.create({
        code,
        description,
        discount,
        minpurchase,
        quantity,
        vstartdate,
		vexpirydate,

    }).then((vouchers) => {
        res.redirect('/tailor/vouchers');
    }).catch(err => console.log(err))
});

// tailor: update voucher
router.get('/updateVoucher/:id', ensureAuthenticated, (req, res) => {
    Voucher.findOne({
        where: {
            id: req.params.id
        },
		raw:true
    }).then((vouchers) => {
        res.render('tailor/updatevoucher', {
			title: "Update voucher",
            vouchers : vouchers
        });
    }).catch(err => console.log(err));
});

router.put('/updateVoucher/:id', ensureAuthenticated, (req, res) => {
    let code = req.body.code;
    let description = req.body.description;
    let discount = req.body.discount;
    let minpurchase = req.body.minpurchase;
    let quantity = req.body.quantity;
	let vstartdate =  req.body.vstartdate;
    let vexpirydate =  req.body.vexpirydate;
   
    Voucher.update({
        code,
        description,
        discount,
        minpurchase,
        quantity,
        vstartdate,
		vexpirydate,
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/tailor/vouchers');
    }).catch(err => console.log(err));
});

// tailor: delete voucher
router.get('/deleteVoucher/:id', ensureAuthenticated,(req, res) => {
    let voucherID = req.params.id;
	let userID = req.user.id;
    Voucher.findOne({
        where: {
            id: voucherID,
        }
    }).then((vouchers) => {
        if (vouchers != null) {
            Voucher.destroy({
                where: {
                    id: voucherID
                }
            }).then((vouchers) => {
                alertMessage(res, 'info', 'Voucher deleted successfully.', 'far fa-trash-alt', true);
                res.redirect('/tailor/vouchers');
            })
        } else {
            alertMessage(res, 'danger', 'Unauthorised access to voucher', 'fas fa-exclamation-circle', true);
            res.redirect('/logout');
        }
    }).catch(err => console.log(err)); 
});

// tailor: view deals
router.get('/tailordeals', ensureAuthenticated, (req, res) => {
	Deal.findAll({
        where: {
        },
        order: [
            ['pname', 'ASC']
        ],
        raw: true,
    })
        .then((deals) => {
            res.render('tailor/tailordeals', {
				title: "Deals List",
                deals : deals
            });
        })
        .catch(err => console.log(err));
});

// tailor: add deal
router.get('/adddeal', ensureAuthenticated, (req, res) => {
	res.render('tailor/adddeal', { title: "Add Flash Deal" });
});

router.post('/adddeal', ensureAuthenticated, (req, res) => {
    let pname = req.body.pname;
    let discountp = req.body.discountp;
	let originalp = req.body.originalp;
	let dstartdate =  req.body.dstartdate;
    let dexpirydate =  req.body.dexpirydate;

    Deal.create({
        pname,
        discountp,
		originalp,
        dstartdate,
        dexpirydate,

    }).then((deals) => {
        res.redirect('/tailor/tailordeals');
    }).catch(err => console.log(err))
});

// tailor: update deal
router.get('/updatedeal/:id', ensureAuthenticated, (req, res) => {
	Deal.findOne({
        where: {
            id: req.params.id
        },
		raw:true
    }).then((deals) => {
        res.render('tailor/updatedeal', {
			title: "Update deal",
            deals : deals
        });
    }).catch(err => console.log(err));
});

router.put('/updatedeal/:id', ensureAuthenticated, (req, res) => {
    let pname = req.body.pname;
    let discountp = req.body.discountp;
	let originalp = req.body.originalp;
	let dstartdate =  req.body.dstartdate;
    let dexpirydate =  req.body.dexpirydate;
   
    Deal.update({
        pname,
        discountp,
		originalp,
        dstartdate,
        dexpirydate,
    }, {
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/tailor/tailordeals');
    }).catch(err => console.log(err));
});

// tailor: delete deal
router.get('/deletedeal/:id', ensureAuthenticated, (req, res) => {
    let dealID = req.params.id;
    Deal.findOne({
        where: {
            id: dealID,
        }
    }).then((deals) => {
        if (deals != null) {
            Deal.destroy({
                where: {
                    id: dealID
                }
            }).then((deals) => {
                alertMessage(res, 'info', 'Deal deleted successfully.', 'far fa-trash-alt', true);
                res.redirect('/tailor/tailordeals');
            })
        } else {
            alertMessage(res, 'danger', 'Unauthorised access to deal', 'fas fa-exclamation-circle', true);
            res.redirect('/logout');
        }
    }).catch(err => console.log(err)); 
});

// tailor: view sales
router.get('/sales', (req, res) => {
	res.render('tailor/sales', { title: "Sales Chart" });
});

// tailor: change target
router.get('/target', (req, res) => {
	res.render('tailor/target', { title: "Change Target" });
});

// tailor: view orders
router.get('/orders', (req, res) => {
	res.render('tailor/orders', { title: "Orders List" });
});

module.exports = router;
