const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const serverPort = require("./config").serverPort;
const auth = require('./routes/auth');
const tweet = require('./routes/tweet');
const profile = require('./routes/profile');
const media = require('./routes/media');

global.appRoot = path.resolve(__dirname);

var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//serve static files
//app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//enabled routes
router.get('/api/status', (req, res) => {
	return res.status(200).send("Gateway running");
});
router.post('/adduser', auth.register);
router.post('/login', auth.login);
router.post('logout', auth.logout);
router.post('/verify', auth.verify);
router.post('/additem', tweet.post);
router.get('/item/:id', tweet.get);
router.delete('/item/:id', tweet.remove);
router.post('/item/:id/like', tweet.like);
router.post('/search', tweet.search);
router.get('/user/:username', profile.getUser);
router.get('/user/:username/followers', profile.getFollower);
router.get('/user/:username/following', profile.getFollowing);
router.post('/follow', profile.follow);
router.post('/addmedia', media.post);
router.get('/media/:id', media.get);

app.use('/', router);
app.listen(serverPort, () => {
	console.log("Server running on port " + serverPort);
})