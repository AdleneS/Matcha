const http = require("http");
const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = "keyboard cat";
const sendEmail = require("../email");
var moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");

router.get("/", (req, res) => {
  res.json({
    message: "Lock",
  });
});

function validateUser(user) {
  const validEmail = typeof user.email == "string" && user.email.trim() != "";
  const validPassword =
    typeof user.password == "string" && user.password.trim() != "" && user.password.trim().length >= 3;

  return validEmail && validPassword;
}

router.post("/signup", (req, res, next) => {
  if (validateUser(req.body)) {
    pool.query("SELECT * FROM users WHERE email = $1", [req.body.email], (error, results) => {
      if (error) throw error;
      else if (results.rows[0] && results.rows[0].mail_confirm) {
        if (bcrypt.compareSync(req.body.password, results.rows[0].password)) {
          const rows = results.rows[0];
          const session = uuidv4();
          const payload = { email: rows.email };
          const info = {
            email: rows.email,
            login: rows.login,
            uid: rows.uid,
            session: session,
            popularity: rows.popularity,
          };
          const token = jwt.sign(payload, secret, {
            expiresIn: "2h",
          });
          pool.query("UPDATE users SET session = $1 WHERE email = $2", [session, req.body.email], (error, results) => {
            if (error) {
              res.status(500).json({ error: error });
            } else {
              res
                .cookie("ssid", token, {
                  expires: new Date(Date.now() + 86400 * 1000),
                  //maxAge: 72000000,
                  httpOnly: true,
                  secure: false,
                  sameSite: "Lax",
                  signed: true,
                })
                .cookie("info", info, {
                  expires: new Date(Date.now() + 86400 * 1000),
                  //maxAge: 72000000,
                  httpOnly: true,
                  secure: false,
                  sameSite: "Lax",
                  signed: true,
                })
                .json({ message: "Logged !", uid: rows.uid })
                .status(200);
            }
          });
        } else {
          res.status(401).json({
            error: "Incorrect password",
          });
        }
      } else {
        res.status(401).json({
          error: "Incorrect email",
        });
      }
    });
  } else {
    next(new Error("Invalid Users " + req.body.password));
  }
});

function validateRegistration(user) {
  const validLogin =
    typeof user.login == "string" && user.login.trim() != "" && user.login.trim().match(/^(?=[a-zA-Z0-9]{5,12}$)/);
  const validEmail =
    typeof user.email == "string" &&
    user.email.trim() != "" &&
    user.email.trim().match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/);
  const validBirthday = typeof user.birthday == "date";
  const validPassword =
    typeof user.password == "string" &&
    user.password.trim() != "" &&
    user.password.trim().match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!-_%*?&+])[A-Za-z\d@$!%-_*?&+]{8,}$/);
  const verifyPassword = user.password == user.verify_password;
  return {
    login: validLogin,
    email: validEmail,
    pass: validPassword,
    v_pass: verifyPassword,
    birthday: validBirthday,
  };
}

router.post("/register", (req, res) => {
  const { login, email, password, birthday, gender, sexual_orientation, firstname, name } = req.body;
  var err = validateRegistration(req.body);
  const uid = uuidv4();
  if (err.email && err.pass && err.v_pass && err.login) {
    pool.query(
      "INSERT INTO users (login, uid, email, password, date, birthday, gender, sexual_orientation, firstname, name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [
        login,
        uid,
        email,
        bcrypt.hashSync(password, 10),
        moment().format("YYYY/MM/DD"),
        moment(birthday, "YYYY/MM/DD"),
        gender.toLowerCase(),
        sexual_orientation.toLowerCase(),
        firstname,
        name,
      ],
      async (error, results) => {
        if (error) {
          res.status(401).json({ error: error });
        } else {
          await sendEmail.sendEmail(uid, email);
          res.status(200).json({ message: "New User: " + email });
        }
      }
    );
  } else {
    if (!err.login || err.login === null) res.status(401).json({ error: "login" });
    else if (!err.email) res.status(401).json({ error: "email" });
    else if (!err.pass) res.status(401).json({ error: "pass" });
    else if (!err.v_pass) res.status(401).json({ error: "v_pass" });
    else if (!err.birthday) res.status(401).json({ error: "birthday" });
  }
});
module.exports = router;
