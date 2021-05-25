const express = require('express');
const router = express.Router();
var validator = require('validator');
var bodyParser = require('body-parser');
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');

///////// Cant get it to work, copy n paste if theres a fix from main.js / /////////////

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Add product using HTTP post => /tailor/addproduct
router.post('/addproduct', urlencodedParser, (req, res) => {
	let errors = [];

	// Validation???
	let {name, price, discount, description, question, q1category} = req.body;

	if (name.length < 3) {
		errors.push({ msg: 'Name should be at least 3 character.' });
	}

	var q1choices_array = [];
	let q1choices = "";
	if (q1category == "radiobtn") {
		// Check if there's at least 2 choices
		var fieldNum = parseInt(req.body.fieldNum);
		// this part gotta change to join ';'
		if (fieldNum >= 1) {
			for (i = 0; i < fieldNum; i++) {
				q1choices_array.push(req.body["flist" + i]);
			}
			q1choices = q1choices_array.join(";");
			console.log(q1choices);
		}
	}
	// End of bullshit

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
			q1: req.body.q1,
			q1category: req.body.q1category
		});
	}
});

module.exports = router;