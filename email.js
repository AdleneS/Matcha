const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const pool = require("./db");
const bcrypt = require("bcryptjs");

const sendEmail = async (uid, email) => {
  //et testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "benjamin.duroule@gmail.com",
      pass: "ben31411505",
    },
  });

  token = await uuidv4();
  pool.query("INSERT INTO token (token, uid_user) VALUES ($1, $2)", [token, uid], (error, results) => {
    if (error) {
      throw error;
    }
  });
  // send mail with defined transport object
  let info = await transporter.sendMail(
    {
      from: '"Matcha" <benjamin.duroule@gmail.com>', // sender address
      to: email,
      subject: "confirme email", // Subject line
      text: "confimer votre email", // plain text body
      html: "<a href=http://localhost:3000/confirm_email?token=" + token + ">Cliquer ici pour verifier votre email</a>", // html body
    },
    (error, info) => {
      if (error) {
        throw error;
      }
    }
  );
};

const confirmEmail = (req, res) => {
  const token = req.body.token;
  pool.query("SELECT uid_user FROM token WHERE token = $1", [token], (error, results) => {
    if (error) {
      throw error;
    } else {
      const uid = results.rows[0].uid_user;
      pool.query("UPDATE users SET mail_confirm = $2 WHERE uid = $1", [uid, true], (error, results) => {
        if (error) {
          throw error;
        } else {
          pool.query("DELETE FROM token WHERE token = $1", [token], (error, results) => {});
          res.status(200);
        }
      });
    }
  });
};

const reset = async (req, res) => {
  //let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "benjamin.duroule@gmail.com",
      pass: "ben31411505",
    },
  });

  token = await uuidv4();

  pool.query("SELECT uid FROM users WHERE email = $1", [req.body.email], (error, results) => {
    if (error) {
      throw error;
    } else {
      pool.query(
        "INSERT INTO token (token, uid_user) VALUES ($1, $2)",
        [token, results.rows[0].uid],
        (error, results) => {
          if (error) {
            throw error;
          }
        }
      );
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail(
    {
      from: '"Matcha" <benjamin.duroule@gmail.com>', // sender address
      to: req.body.email,
      subject: "Reset Password", // Subject line
      text: "Reset Password", // plain text body
      html:
        "<a href=http://localhost:3000/reset/password?token=" +
        token +
        ">Cliquer ici pour changer votre mots de passe</a>", // html body
    },
    (error, info) => {
      if (error) {
        throw error;
      }
    }
  );
};

const updatePass = (req, res) => {
  const token = req.body.token;
  const pass = req.body.password;

  if (pass.trim().match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!-_%*?&+])[A-Za-z\d@$!%-_*?&+]{8,}$/)) {
    pool.query("SELECT uid_user FROM token WHERE token = $1", [token], (error, results) => {
      if (error) {
        throw error;
      } else if (results.rows.length) {
        const uid = results.rows[0].uid_user;
        pool.query(
          "UPDATE users SET password = $2 WHERE uid = $1",
          [uid, bcrypt.hashSync(pass, 10)],
          (error, results) => {
            if (error) {
              throw error;
            } else {
              pool.query("DELETE FROM token WHERE token = $1", [token], (error, results) => {});
              res.status(200);
            }
          }
        );
      }
    });
  } else {
    res.status(400).json({
      err: "Incorrect email",
    });
  }
};

module.exports = {
  sendEmail,
  confirmEmail,
  reset,
  updatePass,
};
