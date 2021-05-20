const express = require('express');
const router = express.Router();
var validator = require('validator');
var bodyParser = require('body-parser');
const Catalouge = require('../models/Catalouge');

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

	// Not working shit - Array cant be directly placed into get/set funcs
	// Change to relational db instead
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
				custom: [question, q1category],
				customchoices: 'Black'
			})
			.then(result => res.redirect('/view/'+ result.id))
			// .then(() => {
			// 	// DATA SAVED
			// 	return res.redirect('/view/1');
			// })
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