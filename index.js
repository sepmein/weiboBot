var express = require("express"),
	passport = require('passport'),
	util = require('util'),
	WeiboStrategy = require('passport-weibo-2').Strategy,
	Weibo = require('./api');

var appKey = "1878841322"
var appSecret = "eafa164fe950c831c8e604dfcc0221a2";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Weibo profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new WeiboStrategy({
	clientID: appKey,
	clientSecret: appSecret,
	callbackURL: "http://127.0.0.1:3000/oauth/weibo/callback"
}, function(accessToken, refreshToken, profile, done) {
	var api = new Weibo(accessToken, profile.uid);
	//api.setToken(accessToken).trendsWeekly();
	api.suggestionsFavoritesHot(function(body) {
		var id = JSON.parse(body)[0].id;
		api.statusesRepost(id, function(body) {
			console.log(body);
		});
	});
	process.nextTick(function() {
		return done(null, profile);
	})
}));

var app = express();

app.use(express.compress());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser('keyboard emily'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/client/dist/'));
app.use(express.logger());
app.use(express.errorHandler());


app.get('/', function(req, res) {
	res.redirect('/index.html');
});

// GET /auth/weibo
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in weibo authentication will involve redirecting
//   the user to weibo.com.  After authorization, weibowill redirect the user
//   back to this application at /auth/weibo/callback
app.get('/oauth/weibo',
	passport.authenticate('weibo'),
	function(req, res) {
		// The request will be redirected to weibo for authentication, so this
		// function will not be called.
	});

app.get('/oauth/weibo/callback', passport.authenticate('weibo', {
	failureRedirect: '/'
}), function(req, res) {
	res.send(req.body);
});

app.listen(3000);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login')
}

var request = require('request');
request({
	method:"GET",
	url:"https://api.weibo.com/2/trends/weekly.json",
	qs:{
		"access_token" : '2.00PSQaLES97JDC056f0ba78aSZcdrC'
	}
},function(error, response, body){
	console.log(body);
})
