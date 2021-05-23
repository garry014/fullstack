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
	res.render('mainselection', { title: title, path: "landing" })
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
	res.render('user/allnotifications', { title: "View all notifications" });
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
			if (pdetails) {
				console.log(pdetails);
				var getDetails = pdetails;
				var discprice = getDetails['price'] * (1 - (getDetails['discount'] / 100)); // after discount price
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
			else {
				return res.redirect('/404');
			}

		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});
});

// tailor: create course
router.get('/createcourse', (req, res) => {
	res.render('tailor/createcourse', { title: "Create Course" });
});

// tailor: view courses
router.get('/viewcourse', (req, res) => {
	res.render('tailor/viewcourse', { title: "View Course" });
});

// tailor: update course
router.get('/updatecourse', (req, res) => {
	res.render('tailor/updatecourse', { title: "Update Course" });
});

// tailor: add/delete/update course content
router.get('/addcontent', (req, res) => {
	res.render('tailor/addcontent', { title: "Course Content" });
});

// tailor: calendar schedule
router.get('/tailorschedule', (req, res) => {
	res.render('tailor/tailorschedule', { title: "Education Platform Content" });
});

// customer: course catalogue
router.get('/coursecatalogue', (req, res) => {
	res.render('customer/coursecatalogue', { title: "View Shops - Course" });
});

// customer: course catalogue details
router.get('/course', (req, res) => {
	res.render('customer/course', { title: "Course Details" });
});

// customer: course cart payment
router.get('/coursepayment', (req, res) => {
	res.render('customer/coursepayment', { title: "Course Payment" });
});

// customer: course payment successful
router.get('/coursepaymentsuccessful', (req, res) => {
	res.render('customer/coursepaymentsuccessful', { title: "Course Payment Successful" });
});

// customer: education platform
router.get('/educationplatform', (req, res) => {
	res.render('customer/educationplatform', { title: "Education Platform" });
});

// customer: education platform content
router.get('/educationplatformcontent', (req, res) => {
	res.render('customer/educationplatformcontent', { title: "Education Platform Content" });
});

router.get('/educationplatform', (req, res) => {
	res.render('customer/educationplatform', { title: "Education Platform" });
});

router.get('/educationplatformcontent', (req, res) => {
	res.render('customer/educationplatformcontent', { title: "Education Platform Content" });
});

router.get('/custregister', (req, res) => {
	res.render('customer/custregister');
});

router.get('/custregcomplete', (req, res) => {
	res.render('customer/custregcomplete');
});

router.get('/custlogin', (req, res) => {
	alertMessage(res, 'success',
		'You have logged in successfully!', 'fas fa-sign-in-alt', true);
	alertMessage(res, 'danger',
		'Login was unsuccessful. Please try again! ', 'fas fa-exclamation-circle', false);
	res.render('customer/custlogin');
});

router.get('/custaccount', (req, res) => {
	alertMessage(res, 'success',
		'You have updated your account details successfully!', 'fas fa-sign-in-alt', true);
		alertMessage(res, 'danger',
		'Something went wrong. Please try again! ', 'fas fa-exclamation-circle', false);
		alertMessage(res, 'success',
		'You have updated your password successfully!', 'fas fa-sign-in-alt', true);
		let error_msg = 'Your passwords do not match please try again later!';
	res.render('customer/custacct', {error_msg: error_msg});
});

router.get('/rideregister', (req, res) => {
	res.render('rider/rideregister');
});

router.get('/rideregcomplete', (req, res) => {
	res.render('rider/rideregcomplete');
});

router.get('/riderlogin', (req, res) => {
	alertMessage(res, 'success',
		'You have logged in successfully!', 'fas fa-sign-in-alt', true);
	alertMessage(res, 'danger',
		'Login was unsuccessful. Please try again! ', 'fas fa-exclamation-circle', false);
	res.render('rider/riderlogin');
});

router.get('/rideraccount', (req, res) => {
	alertMessage(res, 'success',
		'You have updated your account details successfully!', 'fas fa-sign-in-alt', true);
		alertMessage(res, 'danger',
		'Something went wrong. Please try again! ', 'fas fa-exclamation-circle', false);
		alertMessage(res, 'success',
		'You have updated your password successfully!', 'fas fa-sign-in-alt', true);
		let error_msg = 'Your passwords do not match please try again later!';

	res.render('rider/rideracct', {error_msg: error_msg});
});

router.get('/homerider', (req, res) => {
	res.render('rider/homerider');
});

router.get('/rordersmain', (req, res) => {
	res.render('rider/rordersmain');
});

router.get('/rordersdetails', (req, res) => {
	res.render('rider/rorderdetails');
});

router.get('/racceptorder', (req, res) => {
	res.render('rider/racceptorder');
});

router.get('/rideroutecheck', (req, res) => {
	res.render('rider/rideroutecheck');
});

router.get('/rordercompleted', (req, res) => {
	res.render('rider/rordercompleted');
});

router.get('/riderhist', (req, res) => {
	res.render('rider/rorderhist');
});

router.get('/rwalletransfer', (req, res) => {
	let success_msg = 'You have successfully transferred SGD$10.00 to your card.';
	alertMessage(res, 'danger',
		'You have insufficient funds to transfer. Please try again later.', 'fas fa-exclamation-circle', false);
	res.render('rider/rwalletransfer', 
	{success_msg: success_msg});
});

router.get('/tailorlogin', (req, res) => {
	alertMessage(res, 'success',
		'You have logged in successfully!', 'fas fa-sign-in-alt', true);
	alertMessage(res, 'danger',
		'Login was unsuccessful. Please try again! ', 'fas fa-exclamation-circle', false);
	res.render('tailor/tailorlogin');
});

router.get('/tailoregister', (req, res) => {
	res.render('tailor/tailoregister');
});

router.get('/tailoregcomplete', (req, res) => {
	res.render('tailor/tailoregcomplete');
});

router.get('/hometailor', (req, res) => {
	res.render('tailor/hometailor');
});

router.get('/tailoraccount', (req, res) => {
	alertMessage(res, 'success',
		'You have updated your account details successfully!', 'fas fa-sign-in-alt', true);
		alertMessage(res, 'danger',
		'Something went wrong. Please try again! ', 'fas fa-exclamation-circle', false);
		alertMessage(res, 'success',
		'You have updated your password successfully!', 'fas fa-sign-in-alt', true);
		let error_msg = 'Your passwords do not match please try again later!';
	res.render('tailor/tailoracct', {error_msg: error_msg});
});

 
// tailor: view vouchers
router.get('/vouchers', (req, res) => {
	res.render('tailor/vouchers', { title: "Vouchers" });
});

// tailor: add voucher
router.get('/addVoucher', (req, res) => {
	res.render('tailor/addvoucher', { title: "Add Voucher" });
});

// tailor: update voucher
router.get('/updateVoucher', (req, res) => {
	res.render('tailor/updatevoucher', { title: "Add Voucher" });
});

// tailor: view orders
router.get('/orders', (req, res) => {
	res.render('tailor/orders', { title: "Order List" });
});

// tailor: view sales
router.get('/sales', (req, res) => {
	res.render('tailor/sales', { title: "Sales Chart" });
});

// tailor: change target
router.get('/target', (req, res) => {
	res.render('tailor/target', { title: "Change Target" });
});

// tailor: view deals
router.get('/tailordeals', (req, res) => {
	res.render('tailor/tailordeals', { title: "Flash Deals" });
});

// tailor: add deal
router.get('/adddeal', (req, res) => {
	res.render('tailor/adddeal', { title: "Add Flash Deal" });
});

// tailor: update deal
router.get('/updatedeal', (req, res) => {
	res.render('tailor/updatedeal', { title: "Update Flash Deal" });
});

// customer: flash deals
router.get('/flashdeals', (req, res) => {
	res.render('customer/flashdeals', { title: "Flash Deals" });
});






module.exports = router;






// WARNING: DO NOT PUT ANYTHING BELOW //
// 404 Error Page
router.get('*', (req, res) => {
	res.render('404');
});
// LAST LINE OF SCRIPT, NOTHING BELOW PLS //
