const express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
const db = require('../config/DBConfig.js');
const { username, password } = require('../config/db');
const alertMessage = require('../helpers/messenger');
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notifications');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User.js');
const ensureAuthenticated = require('../helpers/auth.js');
const Review = require('../models/Review.js');
var io = require('socket.io')();

////// Flash Error Message for easy referrence ///////
// alertMessage(res, 'success',
// 			'Success!', 'fas fa-check-circle', true);
// alertMessage(res, 'danger',
// 		'Unauthorised access', 'fas fa-exclamation-triangle', true);
//////////////////////////////////////////////

function getToday() {
	// Get Date
	var currentdate = new Date();
	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var datetime = currentdate.getDate() + " "
		+ monthNames[currentdate.getMonth()] + " "
		+ currentdate.getFullYear() + " "
		+ currentdate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	return datetime;
}

function cNotification(recipient, category, message, hyperlink) {
	const data = {
		"recipient": recipient,
		"category": category,
		"message": message,
		"hyperlink": hyperlink,
		"timestamp": getToday()
	}
	
	io.sockets.emit('send_notification', data);

	
	Notification.create({
		hyperlink: hyperlink,
		category: category,
		message: message,
		recipient: recipient,
		status: "Unread",
		time: getToday()
	}).catch(err => {
		console.error('Unable to connect to the database:', err);
	});
}

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/testupload', (req, res) => {
	const title = 'Test upload';
	res.render('testupload', { title: title })
});

router.post('/testupload', (req, res) => {
	if (req.files) {
		console.log(req.files);
		var file = req.files.file;
		var filename = file.name;
		console.log("this one ", file);

		file.mv('./public/uploads/products/' + filename, function (err) {
			if (err) {
				res.send(err);
			}
			else {
				res.send("File Uploaded");
			}
		});
	}
});

router.get('/', (req, res) => {
	const title = 'TailorNow Home';
	res.render('mainselection', { title: title, path: "landing" });
});


// Customer Notifications
router.get('/notification', (req, res) => {
	res.render('user/allnotifications', { title: "View all notifications" })
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

// Post Route to start chat
router.post('/chatwith/:name', ensureAuthenticated, (req, res) => {
	if (typeof req.user != "undefined") {
		var currentuser;
		if(req.user.dataValues.usertype == "tailor"){
			currentuser = req.user.dataValues.shopname;
		}
		else {
			currentuser = req.user.dataValues.username;
		}
	}

	Chat.findAll({
		where: {
			[Op.and]: [{ sender: currentuser }, { recipient: req.params.name }]
		},
		raw: true
	})
	.then((chats) => {
		cNotification("recipient", "category", "message", "hyperlink")
		if(chats.length>0){
			res.redirect('/inbox/'+chats[0].id);
		}
		else{
			Chat.create({
				sender: currentuser,
				recipient: req.params.name,
				senderstatus: "Read",
				recipientstatus: "Unread"
			})
			.then((chat) =>{
				res.redirect('/inbox/'+chat.id);
			})
			.catch(err => {
				console.error('Unable to connect to the database:', err);
			});
		}
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err);
	});
});

router.get('/inbox/:id', ensureAuthenticated, (req, res) => {
	if (typeof req.user != "undefined") {
		var currentuser;
		if(req.user.dataValues.usertype == "tailor"){
			currentuser = req.user.dataValues.shopname;
		}
		else {
			currentuser = req.user.dataValues.username;
		}
		req.session.username = currentuser;
	}
	var recipient = "";
	const chatMsgs = [];
	const chatids = [];
	Chat.findAll({
		where: {
			[Op.or]: [{ sender: currentuser }, { recipient: currentuser }]
		},
		raw: true
	})
		.then((chats) => {
			// Error: something wrong when chatid > 1
			if (chats) {
				chatIdExist = false;
				// Need to extract ONLY one section of each chats object
				// & check if current webpage ID exists
				for (var c = chats.length-1; c >= 0; c--) {
					console.log(chats[c].id, req.params.id);
					if (chats[c].id == req.params.id) { // 1 is static data
						chatIdExist = true;
						if(currentuser == chats[c].recipient){
							recipient = chats[c].sender;
						}
						else{
							recipient = chats[c].recipient;
						}
					}

					if (chats[c].sender ==currentuser && chats[c].senderstatus == "deleted"){
						chats.splice(c,1);
					}
					else if (chats[c].recipient ==currentuser && chats[c].recipientstatus == "deleted"){
						chats.splice(c,1);
					}
					else {
						chatids.push(chats[c].id);
					}
				};

				Message.findAll({
					where: {
						chatId: chatids
					},
					order: [
						['id', 'DESC'],
					],
					raw: true
				})
					.then((messageInChat) => {
						// Filter to get the biggest msg id FOR EACH chat id.
						const idcheck = chatids.reduce((acc, curr) => (acc[curr] = 0, acc), {});
						const checkedlist = [];
						for (var msg in messageInChat) {
							for (var i in idcheck){
								if (messageInChat[msg].chatId == i && !checkedlist.includes(messageInChat[msg].chatId)){
									idcheck[i] = messageInChat[msg].message;
									checkedlist.push(messageInChat[msg].chatId);
								}
							}
						}

						var keys = Object.keys(idcheck);
						for (var c in chats){
							keys.forEach(function(key){
								if(chats[c].id == key){
									chats[c]["message"] = idcheck[key];
								}
							});
						}

						// console.log(idcheck);
						// console.log(chats);
					})
					.catch(err => {
						console.error('Unable to connect to the database:', err);
					});

				if (chatIdExist == true || req.params.id == "0") {
					Message.findAll({
						where: { chatId: req.params.id, }, // static data 
						raw: true
					})
						.then((messages) => {

							// Get every first message of the chat
							Message.findAll({
								where: { chatId: req.params.id, }, // static data 
								raw: true
							})


							res.render('user/chat', {
								title: "Chat",
								chats: chats,
								messages: messages,
								currentuser: currentuser,
								recipient: recipient,
								id: req.params.id
							});
						})
						.catch(err => {
							console.error('Unable to connect to the database:', err);
						});
				}
				else {
					alertMessage(res, 'danger', 'Access Denied, you do not have permission to view message that is not yours.', 'fas fa-exclamation-triangle', true);
					res.render('user/chat', {
						title: "Chat",
						chats: chats,
						currentuser: currentuser,
						recipient: recipient,
						id: req.params.id
					});
				}
			}
			else {
				res.render('user/chat', { title: "Chat" });
			}

		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});

});

// Chat - Upload Image
router.post('/inbox/uploadimg/:id', (req, res) => {
	const currentuser = req.session.username; //temp var

	var file = req.files.fileUpload;
	var filename = file.name;
	var filetype = file.mimetype.substring(6);
	console.log(file);
	const newid = uuidv4(); // Generate unique file id
	var newFileName = uuidv4().concat(".").concat(filetype);

	file.mv('./public/uploads/chat/' + filename, function (err) {
		if (err) {
			res.send(err);
		}
		else {
			fs.rename('./public/uploads/chat/' + filename, './public/uploads/chat/' + newFileName, function (err) {
				if (err) {
					console.log('ERROR: ' + err)
				}
				else {
					var datetime = getToday();
					Message.create({
						sentby: currentuser,
						timestamp: datetime,
						upload: newFileName,
						chatId: req.params.id
					}).catch(err => {
						console.error('Unable to connect to the database:', err);
					});
					return res.redirect('../../inbox/'+req.params.id);
				}
			});
		}
	});

});

router.post('/inbox/uploadaud', (req, res) => {
	console.log(req.body);
	console.log(req.file);
});

// Customer View Shops
router.get('/viewshops', (req, res) => {
	User.findAll({
		where: {
			usertype: "tailor"
		},
		raw: true
	})
	.then((shopdetails) => {
		Catalouge.findAll({
			// Get all DB values
			// run a for loop to extract only the distinct storename, max discount
			// attributes: [
			// 	[Sequelize.fn('DISTINCT', Sequelize.col('storename')) ,'storename'],
			// ]
		})
			.then((shops) => {
				if (shops) {
					const shop = [];
					for (var s in shops) {
						shop.push(shops[s].dataValues);
					};
	
					// shop.forEach(shopItem => {
					// 	console.log(shopItem);
					// });
					res.render('customer/viewshops', {
						title: "View Shops",
						shopdetails: shopdetails,
						shop: shop
					});
				}
				else {
					res.render('customer/viewshops', { title: "View Shops" });
				}
			})
			.catch(err => {
				console.error('Unable to connect to the database:', err);
			});
	});
});

router.post('/inbox/delete/:id', ensureAuthenticated, (req, res) => {
	// not working
	Chat.findOne({
		where: { id: req.params.id },
		raw: true
	})
	.then((chat) => {
		console.log(chat)
		if(chat.sender == req.session.username){
			console.log("changing recipientstatus")
			Chat.update({
				senderstatus: "deleted" 
			}, {
				where: { id: req.params.id }
			})
			.catch(err => console.log(err));
		}
		else{
			Chat.update({
				recipientstatus: "deleted" 
			}, {
				where: { id: req.params.id }
			})
			.catch(err => console.log(err));
		}
	})
	.catch(err => console.log(err));
	alertMessage(res, 'success', 'Deleted message successfully!', 'fas fa-check-circle', true);
	res.redirect('../../inbox/'+req.params.id);
});

// Customer View Shop Items
router.get('/viewshops/:storename', (req, res) => {
	Catalouge.findAll({
		where: { storename: req.params.storename },
		raw: true
	})
		.then(shopprod => {
			title = 'View Items - ' + req.params.storename;
			user_status = "cust";
			if (typeof req.user != "undefined") {
				user_status = res.locals.user.usertype;
			}
			res.render('customer/viewstore', {
				title: title,
				shopprod: shopprod,
				user_status: user_status,
				storename: req.params.storename
			});
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

				Review.findAll({
					where: { productid: req.params.id },
					raw: true
				})
				.then((reviews) => {
					res.render('customer/productview', {
						title: pdetails.name + ' - ' + pdetails.storename,
						pdetails: getDetails,
						choicesArray: choicesArray,
						discprice: discprice,
						reviews:reviews
					});
				})
				.catch(err => {
					console.error('Unable to connect to the database:', err);
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
