const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const pool = require("./db");

const sendEmail = async (request, response) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "benjamin.duroule@gmail.com",
      pass: "ben31411505",
    },
  });

  pool.query(
    "INSERT INTO token (token, uid_user) VALUES ($1, $2)",
    [uuidv4(), request.body.userUid],
    (error, results) => {
      if (error) {
        throw error;
      }
    }
  );
  // send mail with defined transport object
  let info = await transporter.sendMail(
    {
      from: '"Matcha" <benjamin.duroule@gmail.com>', // sender address
      to: request.body.email,
      subject: "Hello test ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    },
    (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    }
  );
  response.json({ info: "success" }).status(200);
};

module.exports = {
  sendEmail,
};
