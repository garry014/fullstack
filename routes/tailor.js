// Form submit/redirect links /tailor/___________
// But the links here, put /________ directly
const express = require('express');
const router = express.Router();
var validator = require('validator');
const alertMessage = require('../helpers/messenger');
var bodyParser = require('body-parser');
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');

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

	// Validation
	let {name, price, discount, description, question, q1category} = req.body;

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
	let q1choices = "";
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
			q1choices = q1choices_array.join(";");
			console.log(q1choices);
		}
		else {
			errors.push({ msg: 'Please ensure your dropdown menu has 1 or more choices.'})
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
	let {name, price, discount, description, question, q1category} = req.body;

	Catalouge.findOne({
		where: { id: req.params.id },
		raw: true
	})
	.then(pdetails => {
		if(pdetails.customcat == "radiobtn" && q1category == "textbox"){
			// if tailor decides to change from radiobtn to textbox
			Productchoices.findAll({
				where: {
					catalougeId: pdetails.id
				}
			})
			.then((choices) =>{
				if(choices != null){
					Productchoices.destroy({
						where: {
							catalougeId: pdetails.id
						}
					});
				}
			})
		}
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err);
	});
	
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
});

module.exports = router;