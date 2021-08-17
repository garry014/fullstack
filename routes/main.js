// DB Table Connections
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User.js');
const Review = require('../models/Review.js');
const Cart = require('../models/Cart');
const BillingDetails = require('../models/BillingDetails');
const Deal = require('../models/Deal');
const Notification = require('../models/Notifications');

// Handlebars Helpers
const alertMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth.js');

// Other Requires
const express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Course = require('../models/Course');
const Video = require('../models/Video');
const CoPay = require('../models/CoPay');
const { request } = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var io = require('socket.io')();
var sess;
const moment = require('moment');

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
	
}

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', (req, res) => {
	const title = 'TailorNow Home';
	sess = req.session;
	if (!("myCart" in sess)) {
		// if dont have key, add key and initialize with empty array to fill in items to cart
		sess["myCart"] = []
		sess["quantity"] = [{ cart_qty: 0 }]
		sess["myBillingDetails"] = null
		sess["cartTotal"] = 0;
	}

	sess["cartSize"] = sess["myCart"].length;
	res.render('mainselection', { title: title, path: "landing" });
});


// Customer Notifications
router.get('/notification', ensureAuthenticated, (req, res) => {
	// send_notification("merlion", "Updates", "Your chat has been sent", "hyperlink");
	//console.log(res.locals.noti);
	res.render('user/allnotifications', { title: "View all notifications" });
});

// Customer : reward page
router.get('/rewardpage', (req, res) => {
	res.render('customer/rewardpage', { title: "Rewards" })
})
// Customer : checkout page
router.get('/customers_checkout', (req, res) => {
	var user_details;
	if (typeof req.user != "undefined") {
		user_details = res.locals.user;
		console.log("userdata", res.locals.user)
	}
	//addons
	let { deliverytime, deliverydate } = req.body;
	console.log(deliverytime, deliverydate);
	sess = req.session;

	console.log(sess["myCart"]);
	Deal.findAll({
						
		raw: true
	})
		.then((deals) => {
			sess["myCart"].forEach(cartItem => {
				deals.forEach(d => {
					if (d.catid == cartItem.productId){
						cartItem.price = parseFloat(d.discountp);
						cartItem.subtotal = cartItem.qty * cartItem.price
					}
				});
			});
			let i = 0
			sess["cartTotal"] = 0;
			for (let item of sess["myCart"]) {
				item.itemId = i;
				sess["cartTotal"] += item.subtotal
				++i;
			}
		})
	res.render('customer/customers_checkout', { title: "customers_checkout", sess: sess, user_details: user_details })
})
// Customer : after transaction page
// paypal
router.get('/transaction_complete', (req, res) => {
	sess = req.session;
	userId = res.locals.user.id
	//send into sql
	console.log("cart", sess["mycart"])
	let cartId = Date.now() / 1000;
	sess["myBillingDetails"].carttimestamp = cartId;
	BillingDetails.create(sess["myBillingDetails"])
	.then(success => {
		console.log("Billing details generated ====>", success);
		console.log("did it managed to send through", success);
	}).catch(err => {
		console.error('Unable to connect to the database:', err);
	});

	sess["myCart"].forEach(cartItem => {
		let insertData = {
			name: cartItem.itemname,
			price: cartItem.price,
			quantity: cartItem.qty,
			customqn: cartItem.customqn,
			custom: cartItem.custom,
			userid: res.locals.user.id,
			timestamp: cartId
		}
		console.log("insertData==>", insertData);
		Cart.create(insertData).then(success => {
			console.log("Receipt created==>", success)
			sess["myCart"] = []
			res.locals.cartTotalQuantity = 0;
		}).catch(err => {
			console.error('Unable to connect to the database:', err);
		});

	});


	res.render('customer/transaction_complete', { title: "transaction_complete" })
})



// Billing information details
router.post('/customers_checkout', (req, res) => {
	let errors = [];
	let { firstNamee, lastNamee, Addressline1, Addressline2, city, postalcode, email, phonenumber, dTime, deliverydate } = req.body;
	var user_details;
	sess = req.session;

	// If click cancel
	if(sess["myBillingDetails"] != null){
		sess["myBillingDetails"] = null;
		res.redirect('/customers_checkout');
		console.log("delete myBillingDetails")
		

		return
	}
	if (typeof req.user != "undefined") {
		user_details = res.locals.user;
		// Checks if values is there

		if (firstNamee == "") {
			errors.push({
				msg: 'Name is not there'
			});
		}
		if (lastNamee == "") {
			errors.push({
				msg: 'Name is not there'
			});
		}
		if (req.body.Addressline1 == "") {
			errors.push({
				msg: 'Address1 is not there'
			});
		}
		if (req.body.Addressline2 == "") {
			errors.push({
				msg: 'Address2 is not there'
			});
		}
		if (req.body.city == "") {
			errors.push({
				msg: 'City is not there'
			});
		}
		if (! /^[0-9]{6}$/.test(req.body.postalcode)) {
			errors.push({
				msg: 'Postal Code must be at least 6 characters'
			});
		}
		if (req.body.email == "") {
			errors.push({
				msg: 'email is not there'
			});
		}
		if (req.body.phonenumber == "") {
			errors.push({
				msg: 'Phone number is not there'
			});
		}
		if (req.body.dTime == "") {
			errors.push({
				msg: 'Delivery time is not there'
			});
		}
		if (req.body.deliverydate == "") {
			errors.push({
				msg: "delivery error is not there"
			});
		}
		if (errors.length > 0) {
			res.render('customer/customers_checkout', {
				errors: errors,
				firstNamee,
				lastNamee,
				Addressline1,
				Addressline2,
				city,
				postalcode,
				email,
				phonenumber,
				dTime,
				deliverydate

			});
		} else {
			console.log("All the billing details filled correctly")
			
			sess["myBillingDetails"] = {
				firstname: req.body.firstNamee,
				lastname: req.body.lastNamee,
				address1: req.body.Addressline1,
				address2: req.body.Addressline2,
				city: req.body.city,
				postalcode: req.body.postalcode,
				email: req.body.email,
				phoneno: req.body.phonenumber,
				deliverytime: req.body.dTime,
				deliverydate: moment(req.body.deliverydate, 'DD/MM/YYYY'),
				carttimestamp: 0,
				OrderStatus: "pending"
			}
			res.redirect('/customers_checkout');
		}
	}
});

//delete
deleteCartItem = (inItemId, sess) => {
	console.log("delete myCart==>",  sess["myCart"])
	let itemId = parseInt(inItemId)
	if (itemId < sess["myCart"].length) {
		sess["myCart"].splice(itemId, 1);
	}
	console.log("delete after myCart==>",  sess["myCart"])
	let i = 0;
	sess["cartTotal"] = 0;
	for (let item of sess["myCart"]) {
		item.itemId = i;
		sess["cartTotal"] += item.subtotal
		++i;
	}

}

router.get('/deleteSessItem/:id', (req, res) => {
	sess = req.session;
	console.log(sess["myCart"]);
	console.log("req.param==>", req.params);
	deleteCartItem(req.params.id, sess);




	res.redirect('/customers_checkout');
});


router.post("/view/:id", (req, res) => {
	// let backURL = req.header('Referer') ||'/'
	let { itemname, id, price, storename, qty, customqn, custom } = req.body;

	console.log("form: ", itemname)
	sess = req.session;
	// to clear cart
	//sess["myCart"] = [] 
	if (!("myCart" in sess)) {
		// if dont have key, add key and initialize with empty array to fill in items to cart
		sess["myCart"] = []
	}
	if (!("myBillingDetails" in sess)) {
		sess["myBillingDetails"] = null
	}

	if (!("quantity" in sess)) {
		sess["quantity"] = ["0"];
	}
	var pdetails = sess["selectedItem"]
	sess["myCart"].push({
		"itemId": 0,
		"itemname": itemname,
		"id": id,
		"price": price,
		"storename": storename,
		"qty": qty,
		"subtotal": qty * price,
		"customqn": (customqn) ? customqn : "Nil",
		"custom": custom,
		"productId": pdetails.id
	})
	// update cart item ID
	let i = 0;
	sess["cartTotal"] = 0;
	for (let item of sess["myCart"]) {
		item.itemId = i;
		sess["cartTotal"] += item.subtotal
		++i;
	}

	// console.log(sess["myCart"]);	
	// // res.redirect(sess["lastViewStore"]["url"]);
	// res.redirect(backURL);
	res.redirect('/viewshops/' + storename+'/1');
});

//customer purchase history
router.get('/purchasehistory', (req, res) => {
	sess = req.session;
	let that = this;
	userId = res.locals.user.id
	sess["purchases"] = []
	Cart.findAll({
		where: { userid: res.locals.user.id },
		raw: true
		// Get all DB values
		// run a for loop to extract only the distinct storename, max discount
		// attributes: [
		// 	[Sequelize.fn('DISTINCT', Sequelize.col('storename')) ,'storename'],
	})
	.then((purchases) => {
		console.log("/purchase_history body data===> ", purchases);
		if(purchases){

		
		let purchaseDict = {}
		for (let data of purchases){
			if(!(data.timestamp in purchaseDict)){
				purchaseDict[data.timestamp] = []
			}
			purchaseDict[data.timestamp].push(data)
		}

		// sess["purchases"] = [];
		// let cartNum = 1;

		// Iterating individual cart purchases so far
		for(let purchaseKey in purchaseDict){
			let purchaseData = purchaseDict[purchaseKey]
			let purchasedCart = {
				cartId:purchaseData[0].timestamp,
				items: [], 
				total: 0
			}
			let itemId = 1

			// Populating items inside one cart purchase
			for(let cartItem of purchaseData){
				let cartInfo = {

				}	
				cartInfo["itemId"] = itemId;
				cartInfo["itemname"] = cartItem.name;
				cartInfo["id"] = cartItem.id;
				cartInfo["qty"] = cartItem.quantity;
				cartInfo["price"] = cartItem.price;
				cartInfo["subtotal"] = cartItem.quantity * cartItem.price;
				purchasedCart["total"] += cartInfo["subtotal"];
				cartInfo["subtotalStr"] = cartInfo["subtotal"].toFixed(2);
				purchasedCart["items"].push(cartInfo);
				itemId += 1;
			}
			purchasedCart["totalStr"] = purchasedCart["total"].toFixed(2);
			sess["purchases"].push(purchasedCart)
		}

		
	}
	else{
		sess["purchases"] = [];
	}
	console.log("sess purchases==>", sess["purchases"])
	// console.log("sess purchases items==>", sess["purchases"][0].items)
	res.render('customer/purchasehistory', {
		title: "Purchase History",
		purchases: sess["purchases"],
	});
	// res.render('customer/purchasehistory', { title: "Purchase History" });
}).catch((err)=>{
//error codes
})
});


// FOR DESIGNING PURPOSES ONLY
router.get('/design', (req, res) => {
	send_notification("recipient", "category", "message", "hyperlink")
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
		if(chats.length>0){
			res.redirect('/c/inbox/'+chats[0].id);
		}
		else{
			if ((req.user.dataValues.username != req.params.name) && (req.user.dataValues.shopname != req.params.name)){
				Chat.create({
					sender: currentuser,
					recipient: req.params.name,
					senderstatus: "Read",
					recipientstatus: "Unread"
				})
				.then((chat) =>{
					// Send res.locals.photo, id
					const data = {receiver: req.params.name, sender: currentuser, photo: req.user.dataValues.photo, chatid: chat.id};
					start_newchat(data);
					res.redirect('/c/inbox/'+chat.id);
				})
				.catch(err => {
					console.error('Unable to connect to the database:', err);
				});
			}
			else {
				alertMessage(res, 'danger', 'Access Denied, you cannot send a message to yourself!', 'fas fa-exclamation-triangle', true);
				res.redirect('back');
			}
		}
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err);
	});
});


router.get('/c/:chat/:id', ensureAuthenticated, (req, res) => { 
	if (typeof req.user != "undefined") {
		var currentuser;
		if (req.user.dataValues.usertype == "tailor") {
			currentuser = req.user.dataValues.shopname;
		}
		else {
			currentuser = req.user.dataValues.username;
		}
		req.session.username = currentuser;
	}
	var recipient = "";
	var isBlocked = false;
	const chatids = [];
	Chat.findAll({
		where: {
			[Op.or]: [{ sender: currentuser }, { recipient: currentuser }]
		},
		raw: true
	})
		.then((chats) => {
			User.findAll({
				attributes: ['username', 'shopname', 'photo'],
				raw: true
			})
				.then((photodetails) => {
					// Error: something wrong when chatid > 1
					if (chats) {
						chatIdExist = false;
						// Need to extract ONLY one section of each chats object
						// & check if current webpage ID exists
						for (var c = chats.length - 1; c >= 0; c--) {
							console.log(chats[c].id, req.params.id);
							if (chats[c].id == req.params.id) { // 1 is static data
								chatIdExist = true;
								if (currentuser == chats[c].recipient) {
									recipient = chats[c].sender;
								}
								else {
									recipient = chats[c].recipient;
								}

								if ((chats[c].senderstatus == "blocked") || (chats[c].recipientstatus == "blocked")){
									isBlocked = true;
								}
							}

							if (chats[c].sender == currentuser && chats[c].senderstatus == "deleted") {
								chats.splice(c, 1);
							}
							else if (chats[c].recipient == currentuser && chats[c].recipientstatus == "deleted") {
								chats.splice(c, 1);
							}
							else {
								if (req.params.chat == "inbox"){
									if (chats[c].sender == currentuser && chats[c].senderstatus == "archive"){
										chats.splice(c, 1);
									}
									else if (chats[c].recipient == currentuser && chats[c].recipientstatus == "archive"){
										chats.splice(c, 1);
									}
									else {
										chatids.push(chats[c].id);
									}
								}
								else if (req.params.chat == "archive") {
									if (chats[c].sender == currentuser && chats[c].senderstatus != "archive"){
										chats.splice(c, 1);
									}
									else if (chats[c].recipient == currentuser && chats[c].recipientstatus != "archive"){
										chats.splice(c, 1);
									}
									else {
										chatids.push(chats[c].id);
									}
								}
								
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
								// Filter to get the greatest msg id FOR EACH chat id.
								const idcheck = {};
								for (var i in chatids){
									idcheck[chatids[i]] = [0]
								}
								console.log(idcheck);
								const checkedlist = [];
								for (var msg in messageInChat) {
									for (var i in idcheck) {
										if (messageInChat[msg].chatId == i && !checkedlist.includes(messageInChat[msg].chatId)) {
											idcheck[i][0] = messageInChat[msg].message;
											idcheck[i].push(messageInChat[msg].timestamp);
											checkedlist.push(messageInChat[msg].chatId);
										}
									}
								}
								
								
								// TO-DO: Filter chat id according to time.
								var keys = Object.keys(idcheck);
								for (var c in chats) {
									keys.forEach(function (key) {
										if (chats[c].id == key) {
											chats[c]["message"] = idcheck[key][0];
											if(idcheck[key][0] !== 0){
												chats[c]["timestamp"] = idcheck[key][1];
											}
										}
									});
									
								}
								
								// Sort by LIFO
								chats.sort(function(a,b){
									// Turn strings into dates, and then subtract them
									// to get a value that is either negative, positive, or zero.
									return new Date(b.timestamp) - new Date(a.timestamp);
								});

								console.log(chats);
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
									
									var rphoto;
									photodetails.forEach(p => {
										if(p.username == recipient){
											rphoto = p.photo;
										}
										else if (p.shopname == recipient){
											rphoto = p.photo;
										}
									});
									

									res.render('user/chat', {
										title: "Chat",
										chats: chats,
										messages: messages,
										currentuser: currentuser,
										recipient: recipient,
										isBlocked: isBlocked,
										id: req.params.id,
										chatstatus: req.params.chat,
										photodetails: photodetails,
										rphoto: rphoto
									});
								})
								.catch(err => {
									console.error('Unable to connect to the database:', err);
								});
						}
						else {
							alertMessage(res, 'danger', 'Access Denied, you do not have permission to view message that is not yours.', 'fas fa-exclamation-triangle', true);
							res.redirect('/c/'+req.params.chat+'/0');
						}
					}
					else {
						res.render('user/chat', { title: "Chat" });
					}
				})


		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});

});

// Chat - Upload Image
router.post('/inbox/uploadimg/:id', (req, res) => {
	const currentuser = req.session.username; //temp var
	const errors = [];

	if (!req.files) {
		errors.push({ msg: 'Please upload an image file.' });
	}
	
	if(errors.length == 0){
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
						res.redirect('/c/inbox/'+req.params.id);
					}
				});
			}
		});
	}
	else {
		alertMessage(res, 'danger', 'Please upload a valid image file.', 'fas fa-exclamation-triangle', true);
		res.redirect('/c/inbox/'+req.params.id);
	}

	

});

router.post('/inbox/uploadaud', (req, res) => {
	console.log(req.body);
	console.log(req.file);
});

// Chat delete
router.post('/inbox/delete/:id', ensureAuthenticated, (req, res) => {
	Chat.findOne({
		where: { id: req.params.id },
		raw: true
	})
	.then((chat) => {
		if(chat.sender == req.session.username){
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
	res.redirect('/c/inbox/0');
});

// Chat block
router.get('/inbox/block/:id', ensureAuthenticated, (req, res) => {
	Chat.findOne({
		where: { id: req.params.id },
		raw: true
	})
	.then((chat) => {
		var blockedUser = "";
		if(chat.sender == req.session.username){
			blockedUser = chat.recipient;
			Chat.update({
				senderstatus: "blocked" 
			}, {
				where: { id: req.params.id }
			})
			.catch(err => console.log(err));
		}
		else{
			blockedUser = chat.sender;
			Chat.update({
				recipientstatus: "blocked" 
			}, {
				where: { id: req.params.id }
			})
			.catch(err => console.log(err));
		}

		alertMessage(res, 'success', 'Successfully blocked ' + blockedUser, 'fas fa-check-circle', true);
		res.redirect('/c/inbox/0');
	})
	.catch(err => console.log(err));
	
});

// Chat unblock
router.get('/inbox/unblock/:id', ensureAuthenticated, (req, res) => {
	Chat.findOne({
		where: { id: req.params.id },
		raw: true
	})
	.then((chat) => {
		var blockedUser = "";
		if(chat.sender == req.session.username){
			blockedUser = chat.recipient;
			Chat.update({
				senderstatus: "Read" 
			}, {
				where: { id: req.params.id }
			})
			.catch(err => console.log(err));
		}
		else{
			blockedUser = chat.sender;
			Chat.update({
				recipientstatus: "Read" 
			}, {
				where: { id: req.params.id }
			})
			.catch(err => console.log(err));
		}

		alertMessage(res, 'success', 'Successfully unblocked ' + blockedUser, 'fas fa-check-circle', true);
		res.redirect('/c/inbox/0');
	})
	.catch(err => console.log(err));
	
});

// Chat Archive
router.get('/archive/:id', ensureAuthenticated, (req, res) => {
	Chat.findOne({
		where: { id: req.params.id },
		raw: true
	})
	.then((chat) => {
		if(chat.sender == req.session.username){
			Chat.update({
				senderstatus: "archive" 
			}, {
				where: { id: req.params.id }
			})
			.catch(err => console.log(err));
		}
		else{
			Chat.update({
				recipientstatus: "archive" 
			}, {
				where: { id: req.params.id }
			})
			.catch(err => console.log(err));
		}
	})
	.catch(err => console.log(err));
	alertMessage(res, 'success', 'Message successfully archived!', 'fas fa-check-circle', true);
	res.redirect('/c/archive/' + req.params.id);
});


// Customer View Shops
router.get('/viewshops', (req, res) => {
	
	Catalouge.findAll({
		// Extract only the distinct storename, (groupby storename) to get max discount
		attributes: [
			[Sequelize.fn('DISTINCT', Sequelize.col('storename')) ,'storename'],
			[Sequelize.fn('MAX', Sequelize.col('discount')), 'discount']
		],
		group: ["storename"],
		raw: true
	})
		.then((shops) => {
			if (shops) {
				// Review average.
				console.log(shops);
				
				User.findAll({
					where: { usertype: "tailor" },
					attributes: ['address1', 'address2', 'city', 'postalcode', 'shopname', 'photo'],
					raw: true
				})
				.then((shopdetails) => {
					// Review Ratings Calculation
					Review.findAll({
						attributes: ['storename', [Sequelize.fn('AVG', Sequelize.col('stars')), 'avgRating']],
						group: 'storename',
						raw: true
					})
					.then((review) => {
						for(var i=0; i<review.length; i++){
							review[i].avgRating = parseFloat(review[i].avgRating);
						}

						// console.log(review);
						// console.log(shopdetails);
						res.render('customer/viewshops', {
							title: "View Shops",
							shopdetails: shopdetails,
							shops: shops,
							review: review
						});
					})
					.catch(err => {
						console.error('Unable to connect to the database:', err);
					});
				})
				.catch(err => {
					console.error('Unable to connect to the database:', err);
				});
				

			}
			else {
				res.render('customer/viewshops', { title: "View Shops" });
			}
		})
});

// Customer View Shops - On search request.
router.post('/viewshops', (req, res) => {
	let { search, cbList, starsFilter } = req.body;
	console.log("'\x1b[36m%s\x1b[0m'", "search: ", search);

	Catalouge.findAll({
		// Filter the required items 
		attributes: [
			[Sequelize.fn('DISTINCT', Sequelize.col('storename')) ,'storename'],
			[Sequelize.fn('MAX', Sequelize.col('discount')), 'discount']
		],
		where: 
			Sequelize.or(
				//{name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%')},
				{storename: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('storename')), 'LIKE', '%' + search + '%')}
			),
		group: ["storename"],
		raw: true
	})
		.then((shops) => {
			if (shops) {
				// If shop does not have discounted item, filter out.
				if (cbList != undefined && cbList.includes('sales')){
					shops = shops.filter(function(item) {
						return item.discount > 0;
					})
				}

				User.findAll({
					where: { usertype: "tailor" },
					attributes: ['address1', 'address2', 'city', 'postalcode', 'shopname', 'photo'],
					raw: true
				})
				.then((shopdetails) => {
					// Review Ratings Calculation
					Review.findAll({
						attributes: ['storename', [Sequelize.fn('AVG', Sequelize.col('stars')), 'avgRating']],
						group: 'storename',
						raw: true
					})
					.then((review) => {
						for(var i=0; i<review.length; i++){
							review[i].avgRating = parseFloat(review[i].avgRating);
							for(var s=0; s<shops.length; s++){
								if (review[i].storename == shops[s].storename){
									shops[s].avgRating = parseFloat(review[i].avgRating);
								}
							}
						}
						
						console.log(shops);
						if (starsFilter != ""){
							shops = shops.filter(function(item) {
								return (item.avgRating >= parseInt(starsFilter) && item.avgRating < parseInt(starsFilter)+1);
							})
						}

						// Filter products
						if(search != ""){
							Catalouge.findAll({
								// Filter the required items 
								where: 
									Sequelize.or(
										{name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%')}
									),
								raw: true
							})
							.then ((products) => {
								if (cbList != undefined && cbList.includes('sales')){
									products = products.filter(function(product) {
										return product.discount > 0;
									})
								}
								console.log(products);
								res.render('customer/viewshops', {
									title: "View Shops",
									shopdetails: shopdetails,
									shops: shops,
									review: review,
									search: search,
									cbList: cbList,
									starsFilter: starsFilter,
									products: products
								});
							})
							.catch(err => {
								console.error('Unable to connect to the database:', err);
							});
						}
						else {
							// if search is not empty.
							res.render('customer/viewshops', {
								title: "View Shops",
								shopdetails: shopdetails,
								shops: shops,
								review: review,
								search: search,
								cbList: cbList,
								starsFilter: starsFilter
							});
						}
					})
					.catch(err => {
						console.error('Unable to connect to the database:', err);
					});
				})
				.catch(err => {
					console.error('Unable to connect to the database:', err);
				});
				

			}
			else {
				res.render('customer/viewshops', { title: "View Shops" });
			}
		})
});


// Customer View Shop Items
router.get('/viewshops/:storename/:page', (req, res) => {
	var page = parseInt(req.params.page) - 1;
	var limit = 6; 
	
	// limit: Remainder of page/6, if 0 > default 6.
	Catalouge.findAndCountAll({
		where: { storename: req.params.storename },
		offset: page*6,
		limit: limit,
		raw: true
	})
		.then(shopprod => {
			console.log((shopprod.rows.length%6 || 0));
			var min_item = (page*limit)+1;
			var max_item;
			if (shopprod.rows.length%6 == 0){
				max_item = ((page+1)*limit);
			}
			else {
				max_item = ((page+1)*limit) - (limit - (shopprod.rows.length%6));
			}
			

			var totalpage = Math.ceil(shopprod.count/limit)
			if (shopprod.count > 0) {
				var itemsId = [];
				shopprod.rows.forEach(e => {
					itemsId.push(e.id);
				});

				Review.findAll({
					where: { productid: itemsId },
					attributes: ['productid', [Sequelize.fn('AVG', Sequelize.col('stars')), 'avgRating']],
					group: 'productid',
					raw: true
				})
					.then((review) => {
						for (var i = 0; i < review.length; i++) {
							review[i].avgRating = parseFloat(review[i].avgRating);
						}
						title = 'View Items - ' + req.params.storename;
						user_status = "cust";
						if (typeof req.user != "undefined") {
							user_status = res.locals.user.usertype;
						}
						res.render('customer/viewstore', {
							title: title,
							shopprod: shopprod.rows,
							total_count: shopprod.count,
							min_item: min_item,
							max_item: max_item,
							user_status: user_status,
							review: review,
							storename: req.params.storename,
							currentpage: req.params.page,
							totalpage: totalpage,
							pagination: {
								page: req.params.page, // The current page the user is on
								pageCount: totalpage  // The total number of available pages
							}
						});
					})
			}
			else {
				title = 'View Items - ' + req.params.storename;
				res.render('customer/viewstore', {
					title: title,
					storename: req.params.storename,
					pagination: {
						page: 1, // The current page the user is on
						pageCount: 1  // The total number of available pages
					}
				});
			}
		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});
});

// Customer View Item
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
				sess=req.session
				sess["selectedItem"] = pdetails;
				
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
					raw: true,
					order: [
						['id', 'DESC'],
					]
				})
				.then((reviews) => {
					var avgRating = 0;
					if(reviews.length > 0){
						reviews.forEach(r => {
							avgRating = avgRating + r.stars;
						});
						avgRating = avgRating / reviews.length;
					}
					
					Deal.findAll({
						
						raw: true
					})
						.then((deals) => {
							var flashdeals = 0;
							deals.forEach(d => {
								if (d.catid == pdetails.id){
									flashdeals = d.discountp;
								}
							});
							res.render('customer/productview', {
								title: pdetails.name + ' - ' + pdetails.storename,
								pdetails: getDetails,
								choicesArray: choicesArray,
								discprice: discprice,
								avgRating: avgRating,
								reviews:reviews,
								deals: flashdeals
							});
					})
					.catch(err => {
						console.error('Unable to connect to the database:', err);
					});
				})
			}
			else {
				return res.redirect('/404');
			}

		})
		.catch(err => {
			console.error('Unable to connect to the database:', err);
		});
});

router.get('/deleteNoti/:id', ensureAuthenticated, (req, res) => {
	Notification.findOne({
		where: {
			id: req.params.id
		}
	}).then((noti) => {
		if (noti != null && noti.recipient == res.locals.user.username) {
			Notification.destroy({
				where: {
					id: req.params.id
				}
			})
			.then(()=>{
				console.log(req.originalUrl);
				
				res.redirect('back');
			});
		}
	});
})

// Send Notifications - Admin
router.get('/createNotifications', ensureAuthenticated, (req, res) => {
	if (typeof req.user != "undefined") {
		if(req.user.dataValues.usertype == "admin"){
			User.findAll({
				attributes: ['username', 'usertype'],
				order: [
					['usertype', 'ASC'],
					['username', 'DESC']
				],
				raw: true
			})
			.then((userdetails) => {
				res.render('user/sendNoti', { 
					title: "Send Notifications",
					userdetails: userdetails
				});
			});
		}
		else {
			alertMessage(res, 'danger', 'Access Denied, you do not have enough rights!', 'fas fa-exclamation-triangle', true);
			res.redirect("/");
		}
	}
});

// POST: Send Notifications - Admin
router.post('/sendnotifications', ensureAuthenticated, (req, res) => {
	let {users_selected, notitext, link} = req.body;
	var errors = [];
	
	if (users_selected == undefined){
		errors.push({ msg: 'Please select at least one recipient.' });
	}
	if (notitext.length <= 3){
		errors.push({ msg: 'Please type in a valid notification message.' });
	}
	if (link.length <=3){
		errors.push({ msg: 'Please type in a valid link.' });
	}

	if (errors.length == 0){
		if(typeof users_selected == "string"){
			send_notification(users_selected, "category", notitext, link);
		}
		else {
			for(var i in users_selected){
				send_notification(users_selected[i], "category", notitext, link);
			}
		}
		alertMessage(res, 'success', 'Success! Sent notifications to ' + users_selected, 'fas fa-check-circle', true);
		res.redirect("/createNotifications");
	}
	else {
		User.findAll({
			attributes: ['username', 'usertype'],
			order: [
				['usertype', 'ASC'],
				['username', 'DESC']
			],
			raw: true
		})
		.then((userdetails) => {
			res.render('user/sendNoti', { 
				title: "Send Notifications",
				userdetails: userdetails,
				errors: errors,
				notitext: notitext,
				link1: link
			});
		});
	}
	
});


// customer view course catalogue
router.get('/viewcshops', (req, res) => {
	Course.findAll({
		raw: true
	})
		.then((course) => {
			// HEHE

			User.findAll({
				where: { usertype: "tailor" },
				attributes: ['id', 'shopname', 'photo'],
				raw: true
			})
				.then((user) => {
					console.log(course);

					const clist = [];
					//console.log(coursesl);
					for (var s in course) {
						clist.push(course[s]);
						//console.log("this is", clist);
					};
					res.render('customer/viewcshops', { title: "View Shops", course: course, user: user });
				})
				.catch(err => {
					console.error('Unable to connect to the database:', err);
				});
		})
});



// customer: course catalogue details
router.get('/course/:id', (req, res) => {
	Course.findOne({
		where: {
			id: req.params.id
		},
		raw: true,
	}).then((course) => {
		// console.log("supp to be tailorid", course.user) //correct
		// var tailorid = course.user;
		User.findOne({
			where: {
				usertype: "tailor",
				id: course.user
			},
			attributes: ['id', 'shopname', 'photo'],
			raw: true
		})
			.then((tuser) => {
				console.log("sname", tuser.shopname, "courseuser", course.user); //corect
				var userId = 0;
				console.log(res.locals.user)
				var checkPur = true;
				if (typeof req.user != "undefined") {
					userId = res.locals.user.id;
				}

				CoPay.findOne({
					where: {
						cuser: userId,
						courseid: req.params.id
					},
					raw: true
				}).then((copay) => {
					if(copay){
						checkPur = false;
					}
					User.findOne({
						where: {
							//this is cust acct 
							id: userId
						}
					}).then((User) => {
						//console.log("HEREeee", course, User);
						res.render('customer/course', { title: "Course Details", course: course, User: User, tuser: tuser, checkPur });
					}).catch(err => console.log(err));
				})
			})
	});
});


// customer: course payment successful (create order or sth )
router.get('/cpaysuccess/:id', (req, res) => {
	user = res.locals.user.id
	//console.log("efewfw0");
	Course.findOne({
		where: {
			id: req.params.id
			//user: user
		},
		raw: true,
	})
		.then((course) => {
			User.findOne({
				where: {
					usertype: "tailor",
					id: course.user
				},
				attributes: ['id', 'shopname'],
				raw: true
			})
				.then((tuser) => {
					console.log("ermz", tuser.shopname);
					CoPay.create({
						courseid: course.id,
						price: course.price,
						tailor: tuser.shopname,
						ctitle: course.ctitle,
						cuser: user,
						description: course.description,
						thumbnail: course.thumbnail
					})
					// console.log("thisone" , copay);
					res.render('customer/cpaysuccess', { title: "Course Payment Successful" });
				})
		}).catch(err => console.log(err));

});



// tailor : manage advertisement
router.get('/manageads', (req, res) => {
	res.render('tailor/manageads', { title: "manageads" })
})
// tailor : advertising 
router.get('/advertise', (req, res) => {
	res.render('tailor/advertise', { title: "advertise" })
})

// riders: main orders page 
router.get('/faq', (req, res) => {
	res.render('user/faq', {title: "FAQ"});
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


module.exports = router;
