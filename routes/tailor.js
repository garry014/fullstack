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
const Calendar = require('../models/Calendar');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const JWT_SECRET = 'secret super'
const jwt = require('jsonwebtoken');
const validator = require("email-validator");
const Regex = require("regex");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');
const { formatDate } = require('../helpers/hbs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
const sgMail = require('@sendgrid/mail');

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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

	// Name Validation
	if (!name) {
		errors.push({ msg: 'Please input a name.' });
	}
	else if (name.length <= 3) { 
		errors.push({ msg: 'Name should be at least 3 character.' });
	}

	// Price Validation
	const dpChecker = /^\-?[0-9]+(?:\.[0-9]{1,2})?$/;
	if (! dpChecker.test(price)) {
		errors.push({ msg: 'Please enter a valid price between 0 to 2000, with at most 2 decimal places. (Eg: 10.50)' });
	}
	else if (price <= 0) {
		errors.push({ msg: 'Please enter a valid price between 0 to 2000. (Eg: 10.50)' });
	}
	else if (price > 2000){
		errors.push({ msg: 'Please enter a valid price between 0 to 2000. (Eg: 10.50)' });
	}
	
	// Discount Validation
	if (! dpChecker.test(discount)) {
		errors.push({ msg: 'Please enter a valid discount between 0 to 99, with no decimal places. (Eg: 10)' });
	}
	else if (discount < 0) {
		errors.push({ msg: 'Please enter a valid discount between 0 to 99. (Eg: 10)' });
	}
	else if (discount > 99) {
		errors.push({ msg: 'Please enter a valid discount between 0 to 99. (Eg: 10)' });
	}

	// Description
	if (description.length > 2000){
		errors.push({ msg: 'Please enter a description no more than 2000 characters.' });
	}

	// Customisable Questions
	if (question != "") {
		if (q1category == "") {
			errors.push({ msg: 'Please select the category, either a textbox or dropdown menu.' });
		}
	}

	if (q1category != "") {
		if (question == "") {
			errors.push({ msg: 'Please fill in a question to ask the customers.' });
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
			question1: question,
			q1category: q1category
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

	// Name Validation
	if (!name) {
		errors.push({ msg: 'Please input a name.' });
	}
	else if (name.length <= 3) { 
		errors.push({ msg: 'Name should be at least 3 character.' });
	}

	// Price Validation
	const dpChecker = /^\-?[0-9]+(?:\.[0-9]{1,2})?$/;
	if (! dpChecker.test(price)) {
		errors.push({ msg: 'Please enter a valid price between 0 to 2000, with at most 2 decimal places. (Eg: 10.50)' });
	}
	else if (price <= 0) {
		errors.push({ msg: 'Please enter a valid price between 0 to 2000. (Eg: 10.50)' });
	}
	else if (price > 2000){
		errors.push({ msg: 'Please enter a valid price between 0 to 2000. (Eg: 10.50)' });
	}
	
	// Discount Validation
	if (! dpChecker.test(discount)) {
		errors.push({ msg: 'Please enter a valid discount between 0 to 99, with no decimal places. (Eg: 10)' });
	}
	else if (discount < 0) {
		errors.push({ msg: 'Please enter a valid discount between 0 to 99. (Eg: 10)' });
	}
	else if (discount > 99) {
		errors.push({ msg: 'Please enter a valid discount between 0 to 99. (Eg: 10)' });
	}

	// Description
	if (description.length > 2000){
		errors.push({ msg: 'Please enter a description no more than 2000 characters.' });
	}

	// Customisable Questions
	if (question != "") {
		if (q1category == "") {
			errors.push({ msg: 'Please select the category, either a textbox or dropdown menu.' });
		}
	}

	if (q1category != "") {
		if (question == "") {
			errors.push({ msg: 'Please fill in a question to ask the customers.' });
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


// stacey

// tailor: create course
router.get('/createcourse',   ensureAuthenticated, (req, res) => {
	res.render('tailor/createcourse', { title: "Create Course" });
});

router.post('/createcourse',   ensureAuthenticated, (req, res) => {
	let errors = [];
	let ctitle = req.body.ctitle;
	let language = req.body.language;
	let day = req.body.day;
	let material = req.body.material;
	let description = req.body.description;
	let price = req.body.price;
	let thumbnail = req.body.thumbnail;


	//validation----------------------------------------------
	if (isNumeric(req.body.price) == false) {
		errors.push({ msg: "Price can only contain numbers." });
	}
	else if (req.body.price < 0 || req.body.price > 200) {
		errors.push({ msg: "Price can only be between $0 to $200." });
	}
	if (req.body.ctitle.length < 5) {
		errors.push({ msg: "Title must be at least 5 characters." });
	}
	if (req.body.material.length < 10) {
		errors.push({ msg: "Materials needed description must be at least 10 characters." });
	}
	if (req.body.description.length < 10) {
		errors.push({ msg: "Course description must be at least 10 characters." });
	}
	if (!req.files) {
		errors.push({ msg: 'No course thumbnail uploaded.' });
	}
	else if (req.files.thumbnail.mimetype.startsWith("image") == false) {
		errors.push({ msg: 'Course thumbnail file must be an image.' });
	}
	else if (req.files) {
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


	if (errors.length > 0) {
		res.render('tailor/createcourse', {
			errors: errors,
			title: "Create Course",
			ctitle,
			language,
			day,
			material,
			description,
			price,
			thumbnail
		});
	} else if (errors.length == 0) {
		// Multi-value components return array of strings or undefined
		Course.create({
			ctitle: ctitle,
			language: language,
			day: day,
			material: material,
			description: description,
			price: price,
			thumbnail: filename,
			user: res.locals.user.id
		}).then((course) => {
			res.redirect('/tailor/viewcourse'); // redirect to call router.get(/listVideos...) to retrieve all updated
			// videos
		}).catch(err => console.log(err))
	}
});


//view courses
router.get('/viewcourse', ensureAuthenticated, (req, res) => {
	Course.findAll({
		where: {
			user: res.locals.user.id //ummmmmmmmmmmmmm
		},
		raw: true

	}).then((course) => {
		User.findOne({
			where: {
				// Compare using passport authentications instead of the usual id.params
				id: res.locals.user.id
			}
		}).then((User) => {
			console.log(User);
			res.render('tailor/viewcourse', { title: "View Course", course: course, User: User });
		}).catch(err => console.log(err));
	});
});

//delete course
router.post('/deletecourse/:id', ensureAuthenticated, (req, res) => {
	Course.findOne({
		where: {
			id: req.params.id, //COURSE ID
			user: res.locals.user.id
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
				res.redirect('/tailor/viewcourse'); // To retrieve all videos again
			}).catch(err => console.log(err));
		} else {
			alertMessage(res, 'danger', 'Unauthorised access to course', 'fas fa-exclamation-circle', true);
			res.redirect('/tailor/viewcourse');
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


router.put('/updatecourse/:id', (req, res) => {
	let errors = [];  // id is course id
	let ctitle = req.body.ctitle;
	let language = req.body.language;
	let day = req.body.day;
	let material = req.body.material;
	let description = req.body.description;
	let price = req.body.price;

	//validation----------------------------------------------
	if (isNumeric(req.body.price) == false) {
		//errors.push({ msg: "Price can only contain numbers." });
		alertMessage(res, 'danger', 'Price can only contain numbers.', true);
		errors.push(1);
	}
	else if (req.body.price < 0 || req.body.price > 200) {
		//errors.push({ msg: "Price can only be between $0 to $200." });
		alertMessage(res, 'danger', 'Price can only be between $0 to $200.', false);
		errors.push(1);
	}
	if (req.body.ctitle.length < 5) {
		//errors.push({ msg: "Title must be at least 5 characters." });
		alertMessage(res, 'danger', 'Title must be at least 5 characters.', false);
		errors.push(1);
	}
	if (req.body.material.length < 1) {
		//errors.push({ msg: "Materials needed description must be at least 10 characters." });
		alertMessage(res, 'danger', 'Materials needed description must be at least 1 characters.', false);
		errors.push(1);
	}
	if (req.body.description.length < 1) {
		//errors.push({ msg: "Course description must be at least 80 characters." });
		alertMessage(res, 'danger', 'Course description must be at least 1 characters.', false);
		errors.push(1);
	}

	if (errors.length == 0) {
		console.log("es");
		Course.update({
			ctitle: ctitle,
			language: language,
			day: day,
			material: material,
			description: description,
			price: price
		}, {
			where: {
				id: req.params.id
			}
		}).then(() => {
			res.redirect('/tailor/viewcourse');
			// videos
		}).catch(err => console.log(err));

	} else if (errors.length > 0) {
		res.redirect('/tailor/updatecourse/' + req.params.id);

	}
});


// tailor: add/delete/update course content
router.get('/addcontent/:id', ensureAuthenticated, (req, res) => {
	Course.findOne({
		where: {
			id: req.params.id, //ummmmmmmmmmmmmm
			user: res.locals.user.id
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

	}).catch(err => console.log(err));

});

//create topic
router.post('/addcontent/:id', ensureAuthenticated, (req, res) => {
	let errors = [];
	let topic = req.body.topic;
	let video = req.body.video;

	if (req.body.topic.length < 5) {
		//errors.push({ msg: "Topic must be at least 5 characters." });
		alertMessage(res, 'danger', 'Topic must be at least 5 characters.', false);
		errors.push(1);
	}
	if (!req.files) {
		//errors.push({ msg: 'No video file uploaded.' });
		alertMessage(res, 'danger', 'No video file uploaded.', false);
		errors.push(1);
	}
	else if (req.files.video.mimetype.startsWith("video") == false) {
		//errors.push({ msg: 'File uploaded must be in .mp4/.mpeg format.' });
		alertMessage(res, 'danger', 'File uploaded must be in .mp4/.mpeg format.', false);
		errors.push(1);
	}
	else if (req.files) {
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
	console.log(errors);
	//error msg not displaying, (id has some issues? may be fixed) i hate this lololol. 
	//should be redirecting correctly, but erroor msg not showing 

	if (errors.length == 0) {
		console.log("here1");
		Video.create({
			topic: topic,
			video: filename,
			courseid: req.params.id
		}).then((videocontent) => {
			res.redirect('/tailor/addcontent/' + req.params.id); // redirect to call router.get(/listVideos...) to retrieve all updated
			// videos
		}).catch(err => console.log(err))
	} else if (errors.length > 0) {
		console.log("here2");
		res.redirect('/tailor/addcontent/' + req.params.id);
	}
});

//delete topic
router.get('/deletecontent/:courseid/:id', (req, res) => {
	Video.findOne({
		where: {
			id: req.params.id //id
		}
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

//view schedule
router.get('/tailorschedule', ensureAuthenticated, (req, res) => {
	console.log("nsdjidsif")
	Calendar.findAll({
		where: {
			user: res.locals.user.id //ummmmmmmmmmmmmm
		},
		attribute: [
			'eventtitle', 'startdate', 'enddate'
		],
		raw: true

	}).then((cal) => {

		for (var i in cal) {
			startdate = new Date(cal[i].startdate);
			cal[i].startdate = dateFormat(startdate, "yyyy-mm-dd") + "T" + dateFormat(startdate, "hh:MM:ss");
			cal[i].enddate = dateFormat(cal[i].enddate, "yyyy-mm-dd") + "T" + dateFormat(cal[i].enddate, "hh:MM:ss");
			console.log(startdate);
		}
		console.log("cal", cal);

		res.render('tailor/tailorschedule', { title: "My Schedule", cal: cal });
	}).catch(err => console.log(err));

});

// create event in schedule
router.post('/createevent', ensureAuthenticated, (req, res) => {
	console.log("helpme");
	let errors = [];
	let eventtitle = req.body.eventtitle;

	let { startdate, enddate, title } = req.body

	if (errors.length == 0) {
		Calendar.create({
			eventtitle: title,
			startdate: startdate,
			enddate: enddate,
			user: res.locals.user.id
		}).then((cal) => {
			res.redirect('/tailor/tailorschedule');
		}).catch(err => console.log(err))
	}
});

// delete event
router.get('/deleteevent/:id', ensureAuthenticated, (req, res) => {
	Calendar.findOne({
		where: {
			id: req.params.id //id
		}
		//raw:true 
	}).then((cal) => {
		console.log(cal)
		if (cal) {
			Calendar.destroy({
				where: {
					id: req.params.id
				}
			}).then(() => {
				alertMessage(res, 'info', 'event deleted', 'far fa-trash-alt', true);
				res.redirect('/tailor/tailorschedule');
			}).catch(err => console.log(err));
		} else {
			alertMessage(res, 'danger', 'Unauthorised access to event', 'fas fa-exclamation-circle', true);
			res.redirect('/tailor/tailorschedule');
		}
	});
});

// create/update event details 
router.post('/eventdetails/:id', (req, res) => {
	let {note} = req.body;
	
	Calendar.findOne({
		where: {
			id: req.params.id //id
		},
		raw:true
	}).then((cal) => {
		Calendar.update({
			note: note
		}, {
			where: {
				id: req.params.id
			}
		}).then(() => {
			alertMessage(res, 'success', 'Note has been updated successfully!', 'fas fa-sign-in-alt', true);
			res.redirect('/tailor/tailorschedule');
		}).catch(err => console.log(err));
		
	})
});


router.get('/tailorlogin', (req, res) => {
	res.render('login')
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
		User.findOne({
			where: {
				usertype:'tailor',
				[Op.or]: [{ email: req.body.email }, { username: req.body.username }]
			},
		})
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
							User.create({ shopname, username, password, address1, address2, city, postalcode, email, phoneno, photo: newFileName, usertype: 'tailor' })
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
	let errors = [];
	let address1 = req.body.address1;
	let address2 = req.body.address2;
	let city = req.body.city;
	let postalcode = req.body.postalcode;
	let shopname = req.body.shopname;
	let password = req.body.password;
	let phoneno = req.body.phoneno;
	let currentpassword = req.body.currentpassword;
	let newpassword = req.body.newpassword;
	let confirmpassword = req.body.confirmpassword;
	const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


	//validation for phone no.
	if (! /^[0-9]{8}$/.test(req.body.phoneno)) {
		alertMessage(res, 'danger',
			'Phone number has to be 8 digits.', 'fas fa-exclamation-circle', false);
		errors.push(1);
	}

	//validation for postalcode
	if (! /^[0-9]{6}$/.test(req.body.postalcode)) {
		alertMessage(res, 'danger',
			'Postal Code have to consist of 6 digits.', 'fas fa-exclamation-circle', false);
		errors.push(1);
	}

	// Image Validation
	if (req.file && req.files.file.mimetype.startsWith("image") == false) {
		alertMessage(res, 'danger',
			'Please upload a valid image file.', 'fas fa-exclamation-circle', false);
		errors.push(1);
	}

	// check if the current password matches the database hash 
	// if (!req.body.currentpassword == false) {
	// 	bcrypt.genSalt(10, (err, salt) => {
	// 		bcrypt.hash(currentpassword, salt, (err, hash) => {
	// 			currentpassword = hash;
	// 			if (hash !== password) {
	// 				console.log(password);
	// 				console.log(hash);
	// 				alertMessage(res, 'danger',
	// 					'Current password is invalid.', 'fas fa-exclamation-circle', false);
	// 			}
	// 		})
	// 	});
	// }

	// compare if the new password is the same as the old password 
	if (currentpassword == newpassword && !req.body.currentpassword == false) {
		alertMessage(res, 'danger',
			'New password cannot be the same as the old password. Please try again.', 'fas fa-exclamation-circle', false);
		errors.push(1);
	}

	// validation for password 
	if (regex.test(newpassword) == false && !req.body.newpassword == false) {
		alertMessage(res, 'danger',
			'Password must contain at least eight characters with at least one uppercase letter, one lowercase letter, one number and one special character.', 'fas fa-exclamation-circle', false);
		errors.push(1);
	}

	// Checks if both passwords entered are the same
	if (newpassword != confirmpassword) {
		alertMessage(res, 'danger',
			'New Passwords do not match.', 'fas fa-exclamation-circle', false);
		errors.push(1);
	}

	if (errors.length > 0) {
		res.redirect('/tailor/tailoraccount/' + req.params.id);
	} else {
		if (req.files) {
			// Image Upload		

			var file = req.files.file;
			var filename = file.name;
			var filetype = file.mimetype.substring(6);
			var newid = uuidv4().concat(".").concat(filetype); // Generate unique file id

			console.log("./public/uploads/user/" + newid);
			file.mv('./public/uploads/user/' + filename, function (err) {
				if (err) {
					res.send(err);
				}
				else {
					fs.rename('./public/uploads/user/' + filename, './public/uploads/user/' + newid, function (err) {
						if (err) console.log('ERROR: ' + err);
					});
					User.update({
						photo: newid
					}, {
						where: {
							id: req.params.id
						}
					});
				}
			});
		}
		if (!req.body.newpassword == false) {
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newpassword, salt, (err, hash) => {
					newpassword = hash;
					User.update({
						password: newpassword,
					}, {
						where: {
							id: req.params.id
						}
					}).then(() => {
						// get value from customeraccount
						alertMessage(res, 'success', 'Password has been updated successfully!', 'fas fa-sign-in-alt', true);
						res.redirect('/tailor/tailoraccount/' + req.params.id);
					}).catch(err => console.log(err));
				})
			});
		}
		else {
			User.update({
				address1,
				address2,
				city,
				postalcode,
				phoneno,
				shopname
			}, {
				where: {
					id: req.params.id
				}
			}).then(() => {
				// get value from customeraccount
				alertMessage(res, 'success', 'Account has been updated successfully!', 'fas fa-sign-in-alt', true);
				res.redirect('/tailor/tailoraccount/' + req.params.id);
			}).catch(err => console.log(err));
		}
	}
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
		sendEmail(user.id, user.email, token);
		res.redirect('../tailor/treset');
	}).catch(err => console.log(err));
});

function sendEmail(id, email, token) {
	sgMail.setApiKey('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');
	// Template('d-a254e8e3c94d469bb1299db777d9bd2b');
	const message = {
		to: email,
		from: 'tailornow2155@gmail.com',
		subject: 'Reset Password Email',
		text: 'You can reset your password here.',
		html: `Please click on this link to reset password.<br><br>
		Please <a href="http://localhost:5000/tailor/resetpassword/${id}/${token}"><strong>Reset</strong></a>
		your Password.`
	};
	return new Promise((resolve, reject) => {
		sgMail.send(message)
			.then(msg => {
				console.log(msg);
				resolve(msg)
			})
			.catch(err => {
				console.log('email err --->', err);
				reject(err)
			});
	});
}

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

// delete user account
router.get('/delete/:id', ensureAuthenticated, (req, res) => {
	let id = req.params.id;
	// Select * from videos where videos.id=videoID and videos.userId=userID
	User.findOne({
		where: {
			id: id,
		},
		attributes: ['id']
	}).then((User) => {
		// if record is found, user is owner of video
		if (User != null) {
			User.destroy({
				where: {
					id: id
				}
			}).then(() => {
				alertMessage(res, 'info', 'Your account has been deleted.', 'far fa-trash-alt', true);
				res.redirect('/tailor/hometailor');
			}).catch(err => console.log(err));
		} else {
			alertMessage(res, 'danger', 'An error occurred. Please try again later.', 'fas fa-exclamation-circle', true);
			res.redirect('/tlogout');
		}
	});
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
	let errors = [];
    let code = req.body.code;
    let description = req.body.description;
    let discount = req.body.discount;
    let minpurchase = req.body.minpurchase;
    let quantity = req.body.quantity;
	//let vstartdate =  req.body.vstartdate;
	let vstartdate = moment(req.body.vstartdate, 'DD/MM/YYYY');
    let vexpirydate = moment(req.body.vexpirydate, 'DD/MM/YYYY');

	if (req.body.code.length < 5) {
		errors.push({ msg: "Code must be at least 5 characters." });
	}
	if (req.body.description.length < 10) {
		errors.push({ msg: "Description must be at least 10 characters." });
	}
	if (isNumeric(req.body.discount) == false) {
		errors.push({ msg: "Discount can only contain numbers." });
	}
	if (req.body.discount < 0) {
		errors.push({ msg: "Discount has to be more than $0." });
	}
	if (isNumeric(req.body.minpurchase) == false) {
		errors.push({ msg: "Minimum purchase can only contain numbers." });
	}
	if (req.body.minpurchase < 0) {
		errors.push({ msg: "Minimum purchase has to be more than $0." });
	}
	if (isNumeric(req.body.quantity) == false) {
		errors.push({ msg: "Quantity can only contain numbers." });
	}
	if (req.body.quantity < 0) {
		errors.push({ msg: "Quantity has to be more than $0." });
	}
	if (errors.length > 0) {
		res.render('tailor/addvoucher', {
			errors: errors,
			title: "Add Voucher",
		});

	} else if (errors.length == 0) {
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
	}
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
	let vstartdate = moment(req.body.vstartdate, 'DD/MM/YYYY');
    let vexpirydate = moment(req.body.vexpirydate, 'DD/MM/YYYY');
   
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
			userID: res.locals.user.id
        },
        raw: true
    })
        .then((deals) => {
			console.log(deals)
			const arr = [];

			for (var i =0; i<deals.length; i++){
				arr.push(deals[i].catid);
			}
			console.log(arr)

			Catalouge.findAll({
				where: { id: arr }, 
				raw: true
			})
			.then((shopprod) => {
				console.log(shopprod)
				res.render('tailor/tailordeals', {
					title: "Deals List",
					deals : deals,
					shopprod: shopprod
				});
			})
            
        })
        .catch(err => console.log(err));
});

// tailor: add deal
// router.get('/adddeal', ensureAuthenticated, (req, res) => {
// 	res.render('tailor/adddeal', { title: "Add Flash Deal" });
// });

router.get('/adddeal', ensureAuthenticated, (req, res) => {
	// Check if user is a tailor, cos i need the shopname
	// i think you should add this part into your other codes too
	if (typeof req.user != "undefined") {
		user_status = res.locals.user.usertype;
	}
	if (user_status == "tailor"){
		// btw do create at least 1 tailor account + 1 product before you can see
		Catalouge.findAll({
			where: { storename: res.locals.user.shopname },
			raw: true
		})
			.then(shopprod => {
				console.log(shopprod);
				res.render('tailor/adddeal', { 
					title: "Add Flash Deal",
					shopprod: shopprod // Shop Products 
				});
			})
		
	}
	else {
		alertMessage(res, 'danger', 'Please register as a tailor to add a flash deal.', 'fas fa-sign-in-alt', true);
		res.redirect('/');
	}
	
});

router.post('/adddeal', ensureAuthenticated, (req, res) => {
	let errors = [];
	let pname = req.body.pname;
    let discountp = req.body.discountp;
	let event = req.body.event;
	var dstartdate = new Date();
    var dexpirydate =  new Date();
	// let dstartdate = moment(req.body.dstartdate, 'DD/MM/YYYY');
    // let dexpirydate =  moment(req.body.dexpirydate, 'DD/MM/YYYY');
	// let eventone = new Date(2021, 08, 12);
	// const eventtwo = new Date('2021, 08, 12');
	// const eventthree = new Date('2021, 08, 13');

	if (isNumeric(req.body.discountp) == false) {
		errors.push({ msg: "Discounted price can only contain numbers." });
	}
	if (req.body.discountp < 0) {
		errors.push({ msg: "Discounted price has to be more than $0." });
	}
	// if(dstartdate < today) {
	// 	errors.push({ msg: "Start date has to be today or later than today." });
	// }
	// if(dexpirydate < today) {
	// 	errors.push({ msg: "End date has to be today or later than today." });
	// }
	// if(dstartdate > dexpirydate) {
	// 	errors.push({ msg: "End date has to be later than stary date." });
	// }

	if (errors.length > 0) {
		Catalouge.findAll({
			where: { storename: res.locals.user.shopname },
			raw: true
		})
			.then(shopprod => {
				console.log(shopprod);
				res.render('tailor/adddeal', {
					errors: errors, 
					title: "Add Flash Deal",
					shopprod: shopprod // Shop Products 
				});
			})
	} else if (errors.length == 0) {
		if (event == "New Store Opening") {
			dstartdate.setDate(15,7,2021);
			dstartdate.setHours(8,0,0,0);
			dexpirydate.setDate(15,7,2021);
			dexpirydate.setHours(7,59,59,0);
		}
		else if (event == "9.9 Flash Sales") {
			dstartdate.setDate(9);
			dstartdate.setMonth(8);
			dstartdate.setYear(2021);
			// dstartdate.setHours(8);
			// dstartdate.setMinutes(0);
			// dstartdate.setSeconds(0);
			dexpirydate.setDate(9);
			dexpirydate.setMonth(8);
			dexpirydate.setYear(2021);
			// dexpirydate.setHours(7);
			// dexpirydate.setMinutes(59);
			// dexpirydate.setSeconds(59);
			dstartdate.setHours(8,0,0,0);
			dexpirydate.setHours(7,59,59,0);
		}
		else if (event == "10.10 Flash Sales") {
			dstartdate.setDate(10);
			dstartdate.setMonth(9);
			dstartdate.setYear(2021);
			dstartdate.setHours(8,0,0,0);
			dexpirydate.setDate(10);
			dexpirydate.setMonth(9);
			dexpirydate.setYear(2021);
			dexpirydate.setHours(7,59,59,0);
		}
		Deal.create({
			catid : pname,
			discountp,
			event,
			dstartdate,
			dexpirydate,
			userID: res.locals.user.id

		}).then((deals) => {
			res.redirect('/tailor/tailordeals');
		}).catch(err => console.log(err))
	}
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
	let event = req.body.event;
	let dstartdate = moment(req.body.dstartdate, 'DD/MM/YYYY');
    let dexpirydate = moment(req.body.dexpirydate, 'DD/MM/YYYY');
   
    Deal.update({
        pname,
        discountp,
		event,
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
