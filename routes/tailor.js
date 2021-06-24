// Redirections/Form submit/hyperlink links /tailor/___________
// But the links here, put /________ directly
const express = require('express');
const router = express.Router();
var validator = require('validator');
const alertMessage = require('../helpers/messenger');
var bodyParser = require('body-parser');
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/Course');
const Video = require('../models/Video');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

function isNumeric(value) {
	return /^\d+$/.test(value);
}

router.get('/addproduct', (req, res) => {
	res.render('tailor/addproduct', { title: "Add product" });
});

// Add Product - POST
router.post('/addproduct', urlencodedParser, (req, res) => {
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
								id: req.params.id,
								name: pdetails.name,
								price: pdetails.price,
								discount: pdetails.discount,
								description: pdetails.description,
								question: pdetails.customqn,
								q1category: pdetails.customcat,
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
						id: req.params.id,
						name: pdetails.name,
						price: pdetails.price,
						discount: pdetails.discount,
						description: pdetails.description,
						question: pdetails.customqn,
						q1category: pdetails.customcat
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
	let { name, price, discount, description, question, q1category } = req.body;

	// Validation
	if (name.length < 3) {
		errors.push({ msg: 'Name should be at least 3 character.' });
	}
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
		// Catalouge.findOne({
		// 	where: { id: req.params.id },
		// 	raw: true
		// })
		// .then(pdetails => {
		// 	if(pdetails.customcat == "radiobtn"){

		// 	}
		// })
		// .catch(err => {
		// 	console.error('Unable to connect to the database:', err);
		// });

		Catalouge.update({
			storename: 'Ah Tong Tailor',
			name: name,
			price: price,
			image: '1.png',
			description: description,
			discount: discount,
			customqn: question,
			customcat: q1category
		}, {
			where: {
				id: req.params.id
			}
		}).then(() => {
			alertMessage(res, 'success', 'Updated product successfully!', 'fas fa-check-circle', true);
			res.redirect('/view/' + req.params.id);
		}).catch(err => console.log(err));


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

	if(req.files){
		
		console.log(req.files);
		var file = req.files.thumbnail;
		var filename = file.name;
		console.log(filename);

		file.mv('./public/uploads/courseimg/'+ filename, function(err){
			if (err){
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
		price:price,
		thumbnail : filename,
		user : 1
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
		res.render('tailor/viewcourse', { title: "View Course", course:course });
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
		raw:true
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
		raw:true
	}).then((course) => {
		//console.log(course);
		res.render('tailor/updatecourse', { title: "Update Course", course:course });
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
		price:price,
		thumbnail : thumbnail,
		user : 1
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
					course:course, 
					videos: videos,
					id:req.params.id 
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
	console.log(topic,video); 
	
	if(req.files){
		console.log(req.files);
		var file = req.files.video;
		var filename = file.name;
		console.log(filename);

		file.mv('./public/uploads/video/'+ filename, function(err){
			if (err){
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
				res.redirect('/tailor/addcontent/' + req.params.courseid ); // To retrieve all videos again
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

module.exports = router;