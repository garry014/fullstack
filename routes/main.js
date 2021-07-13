// DB Table Connections
const Catalouge = require('../models/Catalouge');
const Productchoices = require('../models/Productchoices');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User.js');
const Review = require('../models/Review.js');
const Cart = require('../models/Cart');
const BillingDetails = require('../models/BillingDetails');

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
	}

	sess["cartSize"] = sess["myCart"].length;
	res.render('mainselection', { title: title, path: "landing" });
});


// Customer Notifications
router.get('/notification', (req, res) => {
	// send_notification("merlion", "Updates", "Your chat has been sent", "hyperlink");
	console.log(res.locals.noti);
	res.render('user/allnotifications', { title: "View all notifications" })
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
	res.render('customer/customers_checkout', { title: "customers_checkout", sess: sess, user_details: user_details })
})
// Customer : after transaction page
router.get('/transaction_complete', (req, res) => {
	sess = req.session;
	userId = res.locals.user.id
	//send into sql
	console.log("cart", sess["mycart"])
	let cartId = Date.now() / 1000;

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
		}).catch(err => {
			console.error('Unable to connect to the database:', err);
		});

	});


	res.render('customer/transaction_complete', { title: "transaction_complete" })
})

router.post('/transaction_complete', (req, res) => {
	sess = req.session;
	//send into sql
	//change sql table from cart to billing details
	console.log("Billing Details", sess["mycart"])
	sess["myCart"].forEach(cartItem => {
		Cart.create({
			name: cartItem.itemname,
			price: cartItem.price,
			quantity: cartItem.qty,
			customqn: cartItem.customqn,
			custom: cartItem.custom
		}).catch(err => {
			console.error('Unable to connect to the database:', err);
		});
		sess["myCart"] = []
	});


	res.render('customer/transaction_complete', { title: "transaction_complete" })
})

// Billing information details
router.post('/customers_checkout', (req, res) => {
	var user_details;
	if (typeof req.user != "undefined") {
		user_details = res.locals.user;
		let insertcustdata = {
			firstname: user_details.firstname,
			lastname: user_details.lastname,
			username: user_details.username,
			address1: user_details.address1,
			address2: user_details.address2,
			city: user_details.city,
			postalcode: user_details.postalcode,
			email: user_details.email,
			phoneno: user_details.phoneno,
			deliverytime: req.body.dTime,
			deliverydate: moment(req.body.delivery_date, 'DD/MM/YYYY')
		}
		console.log("create========>", insertcustdata);
		BillingDetails.create(insertcustdata)
			.then(success => {
				res.redirect('/customers_checkout');

				console.log("Billing details generated ====>", success);
				console.log("did it managed to send through", success);
			}).catch(err => {
				console.error('Unable to connect to the database:', err);
			});
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
	for (let item of sess["myCart"]) {
		item.itemId = i;
		++i;
	}

}

router.get('/deleteSessItem/:id', (req, res) => {
	sess = req.session;
	console.log(sess["myCart"]);
	console.log("req.param==>", req.params);
	deleteCartItem(req.params.id, sess);
	// You create a new array (A)
	// var newArray = []

	// for (var item in sess["myCart"]) {
	// 	newArray.push(sess["myCart"][item]);
	// }

	// ///
	// for (var item in newArray) {
	// 	if (newArray[item].itemId == req.params.id) {
	// 		newArray[item].splice("");

	// 		// You give the array A the values of sess["mycart"]
	// 		// For loop to check if itemId == id
	// 		// Pass back values to session
	// 		console.log(newArray);
	// 	}
	// }


	res.redirect('/customers_checkout');
});
// retrieving the data from amelia ( test ) 
router.post("/transaction_complete", (req, res) => {
	let { fname, lname, addressline1, addressline2, City, PostalCode, Email, phone_number } = req.body

	console.log("test", fname)

	if (!("cdetails" in acct)) {
		acct["cdetails"] = []
	}
	acct["cdetails"].push({
		"fname": fname,
		"lname": lname,
		"addressline1": addressline1,
		"addressline2": addressline2,
		"city": City,
		"PostalCode": PostalCode,
		"Email": Email,
		"phone_number": phone_number,

	})
});

router.post("/view/:id", (req, res) => {
	// let backURL = req.header('Referer') ||'/'
	let { itemname, price, storename, qty, customqn, custom } = req.body;

	console.log("form: ", itemname)
	sess = req.session;
	// to clear cart
	//sess["myCart"] = [] 
	if (!("myCart" in sess)) {
		// if dont have key, add key and initialize with empty array to fill in items to cart
		sess["myCart"] = []
	}
	sess["myCart"].push({
		"itemId": 0,
		"itemname": itemname,
		"price": price,
		"storename": storename,
		"qty": qty,
		"subtotal": qty * price,
		"customqn": (customqn) ? customqn : "Nil",
		"custom": custom
	})
	// update card item ID
	let i = 0;
	for (let item of sess["myCart"]) {
		item.itemId = i;
		++i;
	}

	// console.log(sess["myCart"]);	
	// // res.redirect(sess["lastViewStore"]["url"]);
	// res.redirect(backURL);
	res.redirect('/viewshops/' + storename);
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
			
			Chat.create({
				sender: currentuser,
				recipient: req.params.name,
				senderstatus: "Read",
				recipientstatus: "Unread"
			})
			.then((chat) =>{
				// Send res.locals.photo, id
				const data = {receiver: req.params.name, sender: currentuser, photo: req.user.dataValues.photo, id: chat.id};
				start_newchat(data);
				res.redirect('/c/inbox/'+chat.id);
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
	const chatMsgs = [];
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
								// Filter to get the biggest msg id FOR EACH chat id.
								const idcheck = chatids.reduce((acc, curr) => (acc[curr] = 0, acc), {});
								const checkedlist = [];
								for (var msg in messageInChat) {
									for (var i in idcheck) {
										if (messageInChat[msg].chatId == i && !checkedlist.includes(messageInChat[msg].chatId)) {
											idcheck[i] = messageInChat[msg].message;
											checkedlist.push(messageInChat[msg].chatId);
										}
									}
								}

								var keys = Object.keys(idcheck);
								for (var c in chats) {
									keys.forEach(function (key) {
										if (chats[c].id == key) {
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
							res.render('user/chat', {
								title: "Chat",
								chats: chats,
								currentuser: currentuser,
								recipient: recipient,
								id: req.params.id,
								chatstatus: req.params.chat,
								photodetails: photodetails
							});
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
	User.findAll({
		where: { usertype: "tailor" },
		attributes: ['address1', 'address2', 'city', 'postalcode', 'shopname', 'photo'],
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
					// Review average.

					const shop = [];
					for (var s in shops) {
						shop.push(shops[s].dataValues);
					};
	
					// shop.forEach(shopItem => {
					// 	console.log(shopItem);
					// });
					
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

						console.log(review);
						console.log(shopdetails);
						res.render('customer/viewshops', {
							title: "View Shops",
							shopdetails: shopdetails,
							shop: shop,
							review: review
						});
					})

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
					var avgRating = 0;
					if(reviews.length > 0){
						reviews.forEach(r => {
							avgRating = avgRating + r.stars;
						});
						avgRating = avgRating / reviews.length;
					}
					
					res.render('customer/productview', {
						title: pdetails.name + ' - ' + pdetails.storename,
						pdetails: getDetails,
						choicesArray: choicesArray,
						discprice: discprice,
						avgRating: avgRating,
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
