const https = require('http');
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


app.get('/', (req, res) => {
		res.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/checkCookie', withAuth, function (req, res) {
	res.sendStatus(200);
});

app.get('/logout', function(req, res){
	res.clearCookie('ssid');
	res.sendStatus(200);
 });

 const handleError = (err, res) => {
	res
	  .status(500)
	  .json({ info: 'Oops! Something went wrong!' })
  };
  
  const upload = multer({
	dest: "./img_container/tmp"
  });

app.post("/imgupload", upload.single("file"),(req, res) => {
	console.log(req.file);
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./img_container/" + req.file.fieldname + '-' + Date.now() + path.extname(req.file.originalname));

    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        res
          .status(200)
          .json({ info: 'File uploaded!' })
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
		  .json({ info: "Only .png files are allowed!" })
      });
    }
  }
);

app.use('/auth', auth)
app.get('/users', db.getUsers)
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
app.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});