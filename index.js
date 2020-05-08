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
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

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

let interval;

io.on("connection", (socket) => {
	console.log(socket.id);
	if (interval) {
	  clearInterval(interval);
	}
	interval = setInterval(() => getApiAndEmit(socket), 1000);
	socket.on("disconnect", () => {
	  console.log("Client disconnected");
	  clearInterval(interval);
	});
  });

const getApiAndEmit = socket => {
	//pool.query('SELECT * FROM likes WHERE uid_liked = $1 ORDER BY id DESC LIMIT 1', [req.cookies.info.uid], (error, results) => {
	//	if (error)
	//		throw error;
	//	res
	//	.json({ info: 'Liked !'})
	//	.status(200)
	//})
	const response = new Date();
	socket.emit("FromAPI", response);
}

app.get('/', (req, res) => {
		res.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/checkCookie', withAuth, function (req, res) {
	res.sendStatus(200);
});

app.get('/logout', function(req, res){
	res.clearCookie('ssid');
	res.clearCookie('uid');
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
				.json({info: 'Unliked !'})
				.status(200)
		 });
		} else {
			pool.query('INSERT INTO likes (uid_liker, uid_liked) VALUES ($1, $2)', [liker, liked], (error, results) => {
				if (error){
					res.status(400)
				}
			res
			.json({ info: 'Liked !'})
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