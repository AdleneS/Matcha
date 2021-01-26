const jwt = require("jsonwebtoken");
const secret = "keyboard cat";

const withAuth = function (req, res, next) {
  const token = req.signedCookies.ssid;
  if (!token) {
    res.status(400).json({
      error: "Unauthorized: No token provided",
    });
  } else {
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        res.status(401).json({
          error: "Unauthorized: No token provided",
        });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

module.exports = withAuth;
