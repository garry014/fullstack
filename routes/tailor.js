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

module.exports = router;