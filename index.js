const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const hostname = '127.0.0.1';
const port = 5000;
const app = express();
const db = require('./queries');
const cookieParser = require('cookie-parser');
const withAuth = require('./middleware');
const fs = require('fs');
var auth = require('./auth');
const multer = require('multer');
const path = require('path');
const pool = require('./db');

const server = http.createServer(app);
const io = require('socket.io')(server);
var socketArray = {};

app.use(bodyParser.json())
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
)
app.use(cookieParser());
//app.set('trust proxy', 1)
//app.use(session({
//  name: '_leCookie',
//  secret: 'keyboard cat',
//  resave: true,
//  saveUninitialized: true,
//  cookie: { secure: false, maxAge: 7200000 }
//}))

io.on("connection", (socket) => {
	socket.on('FromAPI', (uid) => {
		socketArray[socket.id] = uid;
		console.log(socketArray[socket.id])
		//console.log('uid : '+ uid + ' from ' +  socket.id)
	});
	socket.on("sendNotif", (data) => {
		console.log(socketArray)
		found = Object.keys(socketArray).find(key => socketArray[key] === data.uid);
		io.to(found).emit('getNotif', data)
	});
	socket.on('disconnect', () => {
		delete socketArray[socket.id]
		console.log('user disconnected');
	  });
  });

app.get('/', (req, res) => {
		res.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/checkCookie', withAuth, function (req, res) {
	res .json({uid: req.cookies.info.uid})
		.status(200);
});

app.get('/logout', function(req, res){
	res.clearCookie('ssid');
	res.clearCookie('info');
	res.sendStatus(200);
 });

 const handleError = (err, res) => {
	res
		.status(500)
		.json({ info: 'Oops! Something went wrong!' })
	};
	
	const upload = multer({
	dest: "./client/public/img_container/tmp"
	});

app.post("/imgupload", upload.single("file"),(req, res) => {
		const tempPath = req.file.path;
		const targetPath = "./client/public/img_container/" + req.file.fieldname + '-' + Date.now() + path.extname(req.file.originalname);
		if (path.extname(req.file.originalname).toLowerCase() === ".png" || ".jpg") {
			fs.rename(tempPath, targetPath, err => {
				if (err) return handleError(err, res);
				pool.query('INSERT INTO img (path, uid, n_pic) VALUES ($1, $2, $3)', [targetPath.slice(15), req.cookies.info.uid, 1], (error, results) => {
					if (error) throw error;});
				res
					.status(200)
					.json({ info: 'File uploaded!' })
			});
		} else {
				fs.unlink(tempPath, err => {
				if (err) return handleError(err, res);

				res
					.status(403)
			.json({ info: "Only .png and .jpg files are allowed!" })
			});
		}
	}
);

app.post('/like', function(req, res){
	const liker = req.cookies.info.uid;
	const liked = req.body.likedUid;
	pool.query('SELECT * FROM likes WHERE uid_liker = $1 AND uid_liked = $2', [liker, liked], (error, results) => {
		if (error){
			throw error
		} else if (results.rows[0]){
		 pool.query('DELETE FROM likes WHERE uid_liker = $1 AND uid_liked = $2', [liker, liked], (error, results) => {
			 if (error){
				res.status(400)
			 }
			 res
				.json({info: 'unlike'})
				.status(200)
		 });
		} else {
			pool.query('INSERT INTO likes (uid_liker, uid_liked) VALUES ($1, $2)', [liker, liked], (error, results) => {
				if (error){
					res.status(400)
				}
			res
			.json({ info: 'like'})
			.status(200)
			});
		}
	});
});

app.use('/auth', auth)
app.get('/users', db.getUsers)
app.get('/users/likes', db.getLikes)
app.get('/pretender', db.getUsersImg)
app.get('/users/:id', db.getUserById)
app.get('/users/:email', db.getUserByEmail)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)
app.use(function(err, req, res, next){
		res.status(err.status || 500);
		res.json({
			message: err.message,
			error: req.app.get('env') === 'development' ? err : {}
		});
		
})

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});