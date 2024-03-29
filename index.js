const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const hostname = "127.0.0.1";
const port = 5000;
const app = express();
const db = require("./queries");
const cookieParser = require("cookie-parser");
const withAuth = require("./middleware");
var auth = require("./auth");
const pool = require("./db");
const info = require("./change_info");
const email = require("./email");
const server = http.createServer(app);
const io = require("socket.io")(server, { cookie: false });
var socketArray = {};
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var moment = require("moment");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser("secret"));

io.on("connection", (socket) => {
  socket.on("FromAPI", (uid) => {
    db.setConnected(uid);
    socketArray[socket.id] = uid;
  });
  socket.on("sendNotif", (notified_uid) => {
    found = Object.keys(socketArray).find((key) => socketArray[key] === notified_uid);
    io.to(found).emit("getNotif");
  });
  socket.on("sendMessage", (receiver_uid) => {
    found = Object.keys(socketArray).find((key) => socketArray[key] === receiver_uid);
    io.to(found).emit("getMessage", socketArray[socket.id]);
  });
  socket.on("disconnect", () => {
    pool.query(
      "UPDATE users SET last_connection = $2 WHERE uid = $1",
      [socketArray[socket.id], moment().format("YYYY/MM/DD, h:mm:ss a")],
      (error) => {
        if (error) throw error;
      }
    );
    db.setDisconnected(socketArray[socket.id]);
    delete socketArray[socket.id];
  });
});

app.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/cookie", (req, res) => {
  res.json({ info: req.signedCookies.info });
});

app.get("/checkCookie", withAuth, function (req, res) {
  pool.query(
    "SELECT uid FROM users WHERE uid = $1 AND session = $2",
    [req.signedCookies.info.uid, req.signedCookies.info.session],
    (error, results) => {
      if (error) {
        //res.clearCookie("ssid");
        //res.clearCookie("info");
        res.status(400).json({
          error: "Bad Cookie",
        });
        throw error;
      } else if (results.rowCount) {
        res.json({ message: "Logged !", uid: results.rows[0].uid }).status(200);
      } else {
        //res.clearCookie("ssid");
        //res.clearCookie("info");
        res.status(400).json({
          error: "Bad Cookies",
        });
      }
    }
  );
});

app.get("/logout", function (req, res) {
  date = new Date();
  db.setDisconnected(req.signedCookies.info.uid);
  res
    .cookie("ssid", "", {
      expires: new Date(Date.now() + 86400 * 1000),
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      signed: true,
    })
    .cookie("info", "", {
      expires: new Date(Date.now() + 86400 * 1000),
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      signed: true,
    });
  res.sendStatus(200);
});

const upload = multer({
  dest: "./client/public/img_container/tmp",
});

app.post("/imgupload", upload.single("file"), (req, res) => {
  const tempPath = req.file.path;
  const targetPath =
    "./client/public/img_container/" + req.file.fieldname + "-" + Date.now() + path.extname(req.file.originalname);
  if (path.extname(req.file.originalname).toLowerCase() === ".png" || ".jpg") {
    fs.rename(tempPath, targetPath, (err) => {
      if (err) {
        throw err;
      }
      pool.query("SELECT * FROM img WHERE uid = $1", [req.signedCookies.info.uid], (error, check_img) => {
        if (error) throw error;
        if (check_img.rowCount < 5) {
          pool.query(
            "INSERT INTO img (path, uid, n_pic) VALUES ($1, $2, $3)",
            [targetPath.slice(15), req.signedCookies.info.uid, check_img.rowCount + 1],
            (error, results) => {
              if (error) throw error;
            }
          );
          res.status(200).json({ info: "File uploaded!" });
        } else {
          res.status(403).json({ info: "Only .png and .jpg files are allowed!" });
        }
      });
    });
  } else {
    fs.unlink(tempPath, (err) => {
      if (err) {
        throw err;
      }
      res.status(403).json({ info: "Only .png and .jpg files are allowed!" });
    });
  }
});
const handleError = (err, res) => {
  res.status(500).json({ info: "Oops! Something went wrong!" });
};

app.use("/auth", auth);

app.get("/pretender/:offset/:limit", db.getUsersImg);
app.get("/users/uid/", db.getUsersByUid);

app.post("/search/:offset/:limit", db.postSearch);
app.get("/users", db.getUsers);
app.get("/users/likes", db.getLikes);
app.get("/users/popularity", db.updatePopularity);
app.post("/users", db.createUser);

app.get("/pretender", db.getUsersImg);
app.post("/like", db.like);

app.post("/match/create", db.createMatch);
app.post("/match/delete", db.deleteMatch);
app.get("/match/get", db.getMatch);

app.get("/chat/get/:match_uid", db.getMessages);
app.post("/chat/create/:match_uid", db.createMessages);

app.post("/notif/create", db.createNotif);
app.get("/notif/get", db.getNotif);
app.get("/notif/getnb", db.getNotifNb);
app.post("/notif/setseen", db.setNotifSeen);
app.post("/users/location", db.updateLocation);

app.get("/checkpic", db.checkPic);
app.get("/profile/gallery/:uid", db.getAllImg);
app.get("/profile/:uid", db.getUsersProfile);
app.get("/profile/like/:uid", db.getOneLike);
app.get("/profile/likeYou/:uid", db.getYouLike);
app.post("/profile/report/", db.addReport);
app.post("/profile/block/", db.addBlock);
app.get("/profile/getBlock/:uid", db.getBlock);

app.get("/change/sortImage", info.sortImage);
app.post("/change/deleteImage", info.deleteImage);
app.post("/change/deleteTag", info.deleteTag);
app.get("/change/tag/:uid", info.sortTags);
app.post("/change/login", info.updateLogin);

app.post("/email/confirm", email.confirmEmail);
app.post("/email/reset", email.reset);
app.post("/email/updatepass", email.updatePass);
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
