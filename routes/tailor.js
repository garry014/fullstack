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
const bcrypt = require('bcryptjs');
const passport = require('passport');
const ensureAuthenticated = require('../helpers/auth');


var urlencodedParser = bodyParser.urlencoded({ extended: false });

function isNumeric(value) {
	return /^\d+$/.test(value);
}

router.get('/addproduct', (req, res) => {
	res.render('tailor/addproduct', { title: "Add product" });
});

// ACTUAL ADD PRODUCT PAGE
router.get('/addproduct1', (req, res) => {
	res.render('tailor/addproduct1', { title: "Add product" });
});

// Add Product - POST
router.post('/addproduct', urlencodedParser, (req, res) => {
	let errors = [];
	let {name, price, discount, description, question, q1category} = req.body;

	// Validation
	if (name.length < 3) { 
		errors.push({ msg: 'Name should be at least 3 character.' });
	}
	if (isNumeric(price) == false){
		errors.push({ msg: 'Please enter a valid number between 0 to 2000.'});
	}
	else if (price > 2000){
		errors.push({ msg: 'Please enter a valid number between 0 to 2000.'});
	}
	if (isNumeric(discount) == false){
		errors.push({ msg: 'Please enter a valid number between 0 to 100.'});
	}
	else if (discount > 100){
		errors.push({ msg: 'Please enter a valid number between 0 to 100.'});
	}
	if (question != ""){
		if (q1category == ""){
			errors.push({ msg: 'Please select the category, either a textbox or dropdown menu.'});
		}
	}

	var q1choices_array = [];
	if (q1category == "radiobtn") {
		var fieldNum = parseInt(req.body.fieldNum);
		if (fieldNum >= 1) {
			for (i = 0; i < fieldNum; i++) {
				if(req.body["flist" + i] == ""){
					var a = i+1;
					errors.push({ msg: 'Dropdown menu choice ' + a + ' cannot be empty, please remove, or fill in the box.'});
				}
				else{
					q1choices_array.push(req.body["flist" + i]);
				}
			}
		}
		else {
			errors.push({ msg: 'Please ensure your dropdown menu has 1 or more choices.'});
		}
	}

	if (errors.length == 0) {
		Catalouge
			.create({
				storename: 'Ah Tong Tailor',
				name: name,
				price: price,
				image: '1.png',
				description: description,
				discount: discount,
				customqn: question,
				customcat: q1category
			})
			.then(result => {
				let cataid = result.id;
				if (q1category == "radiobtn"){
					q1choices_array.forEach(c => {
						console.log("here:"+ cataid);
						Productchoices.create({
							choice: c,
							catalougeId: cataid
						})
						.catch(err => {
							console.error('Unable to connect to the database:', err);
						});
					})
				}
				res.redirect('/view/'+ result.id);
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
			if(pdetails.customcat == "radiobtn"){
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
	let {name, price, discount, description, question, q1category} = req.body;

	// Validation
	if (name.length < 3) { 
		errors.push({ msg: 'Name should be at least 3 character.' });
	}
	if (isNumeric(price) == false){
		errors.push({ msg: 'Please enter a valid number between 0 to 2000.'});
	}
	else if (price > 2000){
		errors.push({ msg: 'Please enter a valid number between 0 to 2000.'});
	}
	if (isNumeric(discount) == false){
		errors.push({ msg: 'Please enter a valid number between 0 to 100.'});
	}
	else if (discount > 100){
		errors.push({ msg: 'Please enter a valid number between 0 to 100.'});
	}
	if (question != ""){
		if (q1category == ""){
			errors.push({ msg: 'Please select the category, either a textbox or dropdown menu.'});
		}
	}

	var q1choices_array = [];
	console.log(q1choices_array);
	if (q1category == "radiobtn") {
		var fieldNum = parseInt(req.body.fieldNum);
		if (fieldNum >= 1) {
			for (i = 0; i < fieldNum; i++) {
				if(req.body["flist" + i] != ""){
					var flist = req.body["flist" + i];
					console.log(flist);
					q1choices_array.push(flist);
				}
				else{
					var a = i+1;
					errors.push({ msg: 'Dropdown menu choice ' + a + ' cannot be empty, please remove, or fill in the box.'});
				}
				console.log(q1choices_array);
			}
		}
		else {
			errors.push({ msg: 'Please ensure your dropdown menu has 1 or more choices.'});
		}
	}

	if (q1category == "radiobtn") {
		// delete every productchoices so it won't conflict later
		Productchoices.findAll({
			where: {
				catalougeId: req.params.id
			}
		})
		.then((choices) =>{
			if(choices != null){
				Productchoices.destroy({
					where: {
						catalougeId: req.params.id
					}
				})
				.then(()=>{
					q1choices_array.forEach(c => {
						Productchoices.create({
							choice: c,
							catalougeId: req.params.id
						})
						.then(()=>{
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
					.then(()=>{
						console.log("Product choice saved");
					})
					.catch(err => {
						console.error('Unable to connect to the database:', err);
					});
				});
			}
		});
	}

	if (errors.length == 0){
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
		}).then(()=> {
			alertMessage(res, 'success', 'Updated product successfully!', 'fas fa-check-circle', true);
			res.redirect('/view/'+ req.params.id);
		}).catch(err => console.log(err));

		
	}
	else {
		//return error msg
		errors.forEach(error => {
			alertMessage(res, 'danger', error.msg, 'fas fa-exclamation-triangle', true);
		});
		res.redirect('/tailor/editproduct/'+ req.params.id);
	}
});

router.get('/deleteProduct/:id', (req,res)=> {
	Catalouge.findOne({
		where: {
			id: req.params.id
		}
	}).then((pdetails)=>{
		if(pdetails != null){
			if(pdetails.customcat == "radiobtn"){
				Productchoices.destroy({
					where: {
						catalougeId: req.params.id
					}
				});
			}
			Catalouge.destroy({
				where :{
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
	return '/hometailor'
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
		User.findOne({ where: { username: req.body.username } })
			.then(Tailor => {
				if (Tailor) {
					res.render('tailor/tailoregister', {
						error: User.username + 'already registered',
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
			res.redirect('/logout');
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
module.exports = router;