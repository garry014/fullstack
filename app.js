/*
* 'require' is similar to import used in Java and Python. It brings in the libraries required to be used
* in this JS file.
* */
const express = require('express');
const session = require('express-session');
const upload = require('express-fileupload');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
// const jwt = require('jsonwebtoken')

const flash = require('connect-flash');
const FlashMessenger = require('flash-messenger');

const MySQLStore = require('express-mysql-session');
const db = require('./config/db'); // db.js config file

/*
* Loads routes file main.js in routes directory. The main.js determines which function
* will be called based on the HTTP request and URL.
*/
const mainRoute = require('./routes/main');
const tailorRoute = require('./routes/tailor');
const custRoute = require('./routes/customer');
const riderRoute = require('./routes/rider');
// const pviewRoute = require('./routes/productview');

/*
* Creates an Express server - Express is a web application framework for creating web applications
* in Node JS.
*/
const app = express();
const http = require("http").createServer(app);

// Create socket instance
const io = require('socket.io')(http);
var users = [];

const Chat = require('./models/Chat');
const Message = require('./models/Message');

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

// add listener for new connection
io.on("connection", function (socket) {
	console.log("'\x1b[36m%s\x1b[0m'", "user connected: ", socket.id);

	socket.on('disconnect', () => {
		console.log('user disconnected: ', socket.id);
	});

	socket.on("user_connected", function (username) {
		users[username] = socket.id;

		// socket id will be used to send msg to individual person

		//notify all connect clients
		io.emit("user_connected", username);
	});

	socket.on("send_message", function (data) {
		// send event to receiver
		var socketId = users[data.receiver];

		var datetime = getToday();
		data["timestamp"] = datetime;
		io.to(socketId).emit("new_message", data);
		console.log(data);

		// Save in db
		Message.create({
			sentby: data.sender,
			timestamp: datetime,
			message: data.message,
			chatId: data.chatid
		}).catch(err => {
			console.error('Unable to connect to the database:', err);
		});
	});

	socket.on("send_upload", function (data) {
		// send event to receiver
		var socketId = users[data.receiver];

		io.to(socketId).emit("new_upload", data);
	});
});



// Handlebars Middleware
/*
* 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
* from Node JS.
*
* 2. Node JS will look at Handlebars files under the views directory
*
* 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
*
* */
app.engine('handlebars', exphbs({
	defaultLayout: 'main' // Specify default template views/layout/main.handlebar 
}));
app.set('view engine', 'handlebars');


// Additional Handlebars features
const Handlebars = require('handlebars');
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
	switch (operator) {
		case '==':
			return (v1 == v2) ? options.fn(this) : options.inverse(this);
		case '===':
			return (v1 === v2) ? options.fn(this) : options.inverse(this);
		case '!=':
			return (v1 != v2) ? options.fn(this) : options.inverse(this);
		case '!==':
			return (v1 !== v2) ? options.fn(this) : options.inverse(this);
		case '<':
			return (v1 < v2) ? options.fn(this) : options.inverse(this);
		case '<=':
			return (v1 <= v2) ? options.fn(this) : options.inverse(this);
		case '>':
			return (v1 > v2) ? options.fn(this) : options.inverse(this);
		case '>=':
			return (v1 >= v2) ? options.fn(this) : options.inverse(this);
		case '&&':
			return (v1 && v2) ? options.fn(this) : options.inverse(this);
		case '||':
			return (v1 || v2) ? options.fn(this) : options.inverse(this);
		default:
			return options.inverse(this);
	}
});

Handlebars.registerHelper('money2dp', function (distance) {
	return distance.toFixed(2);
});

Handlebars.registerHelper("calculatedisc", function (price, discount) {
	var a = price * (1 - (discount / 100));
	return a.toFixed(2);
});

Handlebars.registerHelper('getToday', function () {
	return getToday();
});

// Handlebars.registerHelper('ifIncludes', function (location,path) {
// 	debugger
// 	console.log(location);
// 	if (location.includes(path))
// 		return true;
// 	return false
// });

app.use(upload());

// Body parser middleware to parse HTTP body in order to read HTTP data
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, '/public')));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride('_method'));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// To store session information. By default it is stored as a cookie on browser
app.use(session({
	key: 'tailornow_session',
	secret: 'tojiv',
	store: new MySQLStore({
		host: db.host,
		port: 3306,
		user: db.username,
		password: db.password,
		database: db.database,
		clearExpired: true,
		// How frequently expired sessions will be cleared; milliseconds:
		checkExpirationInterval: 900000,
		// The maximum age of a valid session; milliseconds:
		expiration: 900000,
	}),
	resave: false,
	saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(FlashMessenger.middleware);

// Place to define global variables - not used in practical 1
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	if (typeof req.user != "undefined") {
		res.locals.user = req.user.dataValues || null;
	}
	if (req.path.includes('/customer')){
		res.locals.useracctype = 'Customer';
	}
	else if (req.path.includes('/rider')){
		res.locals.useracctype = 'Rider';
	}
	else if (req.path.includes('/tailor')){
		res.locals.useracctype = 'Tailor';
	}
	next();
});

app.use(methodOverride('_method'));
app.use(express.json())
// app.use(express.urlencoded({ extended: false }))
// app.set('view engine', 'ejs')

// Bring in database connection
const tailornowDB = require('./config/DBConnection');
const { getDefaultSettings } = require('http2');
// Connects to MySQL database
tailornowDB.setUpDB(false); // To set up database with new tables set (true)

const authenticate = require('./config/passport');
const User = require('./models/User');
// const { profile } = require('console');
authenticate.localStrategy(passport);
// Use Routes
/*
* Defines that any root URL with '/' that Node JS receives request from, for eg. http://localhost:5000/, will be handled by
* mainRoute which was defined earlier to point to routes/main.js
* */
app.use('/', mainRoute); // mainRoute is declared to point to routes/main.js
app.use('/tailor', tailorRoute);
app.use('/customer', custRoute);
app.use('/rider', riderRoute);

// fix google redirect page problem & must display login name 
passport.use(new GoogleStrategy({
	clientID: '601670228405-m3un3mco0q1q9faa22ho21e1g5abtd1j.apps.googleusercontent.com',
	clientSecret: 'LB_jS4hb3y_jYxTWnKAhr0P8',
	callbackURL: "http://localhost:5000/customer/homecust",
	userProfileURL: 'https://googleapis.com/oauth2/v3/userinfo'
},
	function (accessToken, refreshToken, profile, cb) {
		User.findOrCreate({ googleId: profile.id }, function (err, user) {
			return cb(err, user);
		});
	}
));

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] })
);
app.get("auth/google/homecust", passport.authenticate("google", { failureRedirect: "/customer/custlogin" }),
	function (req, res) {
		res.redirect('customer/homecust');
	}
)
passport.use(new FacebookStrategy({
	clientID: '3000022716989207',
	clientSecret: 'e3883b73cf1392784301194f05963827',
	callbackURL: "http://localhost:5000/customer/homecust"
},
	 function(accessToken, refreshToken, profile, done) {
		User.findOrCreate({ facebookId: profile.id }, function (err, user) {
			if (err) { return done(err); }
			done(null, user);
		});
	}
));

// sth wrong with the facebook authentication
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/homecust',
	passport.authenticate('facebook', {
		successRedirect: '/homecust',
		failureRedirect: '/customer/custlogin'
	}));


// // reset password
// app.get('/forgetpassword', (req, res, next) => {

// })

// app.post('/forgetpassword', (req, res, next) => {

// })

// app.get('/resetpassword', (req, res, next) => {

// })

// app.post('/resetpassword', (req, res, next) => {

// })


app.get('/test', (req, res) => {
	res.render('testchat', { title: "Test Chat" });
});
// This route maps the root URL to any path defined in main.js

// Handle 404 error page - Keep this as a last route
app.use(function (req, res, next) {
	res.status(404);
	res.render('404');
});
// No routes below this, otherwise it will get overwritten.

/*
* Creates a unknown port 5000 for express server since we don't want our app to clash with well known
* ports such as 80 or 8080.
* */
const port = 5000;

http.listen(port, () => {
	console.log('\x1b[36m%s\x1b[0m', `JIAYOUS, IT WILL ALL WORK OUT SOME DAY! Server started on port ${port}.`);
})
