const express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
const db = require('../config/DBConfig.js');
const { username, password } = require('../config/db');
const alertMessage = require('../helpers/messenger');
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');
const Chat = require('../models/Chat');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
	res.render('homecust', { title: title, user: req.user });
});


// Customer Notifications
router.get('/notification', (req, res) => {
	res.render('user/allnotifications', { title: "View all notifications" })
});

// Customer: Review
router.get('/review', (req, res) => {
	res.render('customer/review', { title: "Leave a review" });
});
// Customer : reward page
router.get('/rewardpage', (req, res) => {
	res.render('customer/rewardpage', { title: "Rewards" })
})
// Customer : checkout page
router.get('/customers_checkout', (req, res) => {
	res.render('customer/customers_checkout', { title: "customers_checkout" })
})
// Customer : after transaction page
router.get('/transaction_complete', (req, res) => {
	res.render('customer/transaction_complete', { title: "transaction_complete" })
})

// FOR DESIGNING PURPOSES ONLY
router.get('/design', (req, res) => {
	res.render('customer/testaudio', { title: "Add product" });
});

router.get('/inbox', (req, res) => {
	const currentuser = "Chainsmoker"; //temp var
	Chat.findAll({
		where: {
			[Op.or]: [{sender: currentuser}, {recipient: currentuser}]
		}
	})
		.then((chats) => {
			chat = [];
			if(chats){
				//Need to extract ONLY one section of each object
				for (var c in chats) {
					chat.push(chats[c].dataValues);
				};

				res.render('user/chat', { 
					title: "Chat", 
					chat: chat,
					currentuser: currentuser
				});
			}
			else {
				res.render('user/chat', { title: "Chat" });
			}
			
		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});
});

// Customer View Shops
router.get('/viewshops', (req, res) => {
	Catalouge.findAll({
		// Get all DB values
		// run a for loop to extract only the distinct storename, max discount
		// attributes: [
		// 	[Sequelize.fn('DISTINCT', Sequelize.col('storename')) ,'storename'],
		// ]
	})
	.then((shops)=>{
		if(shops){
			const shop = [];
			for (var s in shops) {
				shop.push(shops[s].dataValues);
			};

			shop.forEach(shopItem => {
				console.log(shopItem);
				
			});
			res.render('customer/viewshops', { 
				title: "View Shops",
				shop: shop
			});
		}
		else{
			res.render('customer/viewshops', { title: "View Shops" });
		}
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err);
	});
});

// Customer View Shop Items
router.get('/viewshops/:storename', (req, res) => {
	Catalouge.findAll({
		where: { storename: req.params.storename },
		raw: true
	})
		.then(shopprod => {
			if (shopprod.length > 0) {
				title = 'View Items - ' + req.params.storename
				user_status = "tailor"
				res.render('customer/viewstore', {
					title: title,
					shopprod: shopprod,
					user_status: user_status
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

router.get("/view/:id", (req, res) => {
	// http://localhost:5000/view/1
	const title = 'Add Product';
	Catalouge.findOne({
		where: { id: req.params.id },
		raw: true
	})
		.then(pdetails => {
			if (pdetails) {
				var choicesArray = [];
				var getDetails = pdetails;
				var discprice = getDetails['price'] * (1 - (getDetails['discount'] / 100)); // after discount price
				// Patrick if you need any values from my side
				// ALL THESE IS WHAT I HAVE: storename, name, price, image, description, discount, custom, customchoices
				// console.log('Example of product name ' + getDetails['name']); 

				// Bug here: cannot run on id that does nt exists.
				if (getDetails['customcat'] == "radiobtn") {
					Productchoices.findAll({
						where: { catalougeId: req.params.id },
						raw: true
					})
						.then(pchoices => {
							pchoices.forEach(element => {
								choicesArray.push(element['choice']);
							});
						})
						.catch(err => {
							console.error('Unable to connect to the database:', err);
						});
				}

				res.render('customer/productview', {
					title: pdetails.name + ' - ' + pdetails.storename,
					pdetails: getDetails,
					choicesArray: choicesArray,
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
// tailor : manage advertisement
router.get('/manageads', (req, res) => {
	res.render('tailor/manageads', { title: "manageads" })
})
// tailor : advertising 
router.get('/advertise', (req, res) => {
	res.render('tailor/advertise', { title: "advertise" })
})


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


// riders: home page 
router.get('/homerider', (req, res) => {
	res.render('rider/homerider');
});
// riders: main orders page 
router.get('/rordersmain', (req, res) => {
	res.render('rider/rordersmain');
});
// riders: order details page 
router.get('/rordersdetails', (req, res) => {
	res.render('rider/rorderdetails');
});
// riders: order accepted sucessfully page 
router.get('/racceptorder', (req, res) => {
	res.render('rider/racceptorder');
});
// riders: checking routes page 
router.get('/rideroutecheck', (req, res) => {
	res.render('rider/rideroutecheck');
});
// riders: orders completed successfully 
router.get('/rordercompleted', (req, res) => {
	res.render('rider/rordercompleted');
});
// riders: orders history
router.get('/riderhist', (req, res) => {
	res.render('rider/rorderhist');
});
// riders: wallet transfer to bank account 
router.get('/rwalletransfer', (req, res) => {
	let success_msg = 'You have successfully transferred SGD$10.00 to your card.';
	alertMessage(res, 'danger',
		'You have insufficient funds to transfer. Please try again later.', 'fas fa-exclamation-circle', false);
	res.render('rider/rwalletransfer',
		{ success_msg: success_msg });
});

// tailor: home page 
router.get('/hometailor', (req, res) => {
	res.render('tailor/hometailor');
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

// logout user 
router.get('/logout', (req, res) => {
	req.logout();
	alertMessage(res, 'info', 'Bye-bye!', 'fas fa-power-off', true);
	res.redirect('/homecust');
});

module.exports = router;
