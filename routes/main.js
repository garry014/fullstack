const express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
const db = require('../config/DBConfig.js');
const { username, password } = require('../config/db');
const alertMessage = require('../helpers/messenger');
const Catalouge = require('../models/Catalouge');

////// Flash Error Message for easy referrence ///////
// alertMessage(res, 'success',
// 			'Success!', 'fas fa-check-circle', true);
// alertMessage(res, 'danger',
// 		'Unauthorised access', 'fas fa-exclamation-triangle', true);
//////////////////////////////////////////////

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', (req, res) => {
	const title = 'TailorNow Home';
	res.render('homecust', { title: title })
});

router.get('/homecust', (req, res) => {
	const title = 'TailorNow Home';
	res.render('homecust', { title: title });
});

router.get('/addproduct', (req, res) => {
	res.render('tailor/addproduct', { title: "Add product" });
});

// ACTUAL ADD PRODUCT PAGE
router.get('/addproduct1', (req, res) => {
	res.render('tailor/addproduct1', { title: "Add product" });
});

// Customer View Shops
router.get('/viewshops', (req, res) => {
	res.render('customer/viewshops', { title: "View Shops" });
});

// Customer View Shop Items
router.get('/view/storename', (req, res) => {
	res.render('customer/viewstore', { title: "View Items - Ah Tong Tailor", user_status: "tailor" });
});

// Customer Notifications
router.get('/notification', (req, res) => {
	res.render('user/allnotifications', { title: "View all notifications"});
});

// Customer: Review
router.get('/review', (req, res) => {
	res.render('customer/review');
});

// FOR DESIGNING PURPOSES ONLY
router.get('/design', (req, res) => {
	res.render('customer/testaudio', { title: "Add product" });
});

router.get('/inbox', (req, res) => {
	res.render('user/chat', { title: "Chat" });
});

router.get("/view/:id", (req, res) => { ///:productid
	// http://localhost:5000/view/1
	const title = 'Add Product';
	Catalouge.findOne({
		where: { id: req.params.id },
		raw: true
	})
		.then(pdetails => {
			if(pdetails){
				console.log(pdetails);
				var getDetails = pdetails;
				var discprice = getDetails['price'] * (1-(getDetails['discount']/100)); // after discount price
				// Patrick if you need any values from my side
				// ALL THESE IS WHAT I HAVE: storename, name, price, image, description, discount, custom, customchoices
				// console.log('Example of product name ' + getDetails['name']); 

				// Bug here: cannot run on id that does nt exists.
				const custom = getDetails['custom'].split(';');
				const customchoices = [];
				if (custom[1] == "radiobtn") {
					customchoices = getDetails['customchoices'].split(';');
				}

				res.render('customer/productview', {
					pdetails: getDetails,
					discprice: discprice
				});
			}
			else{
				return res.redirect('/404');
			}

		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});
});





module.exports = router;






// WARNING: DO NOT PUT ANYTHING BELOW //
// 404 Error Page
router.get('*', (req, res) => {
	res.render('404');
});
// LAST LINE OF SCRIPT, NOTHING BELOW PLS //
