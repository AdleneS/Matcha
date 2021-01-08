const jwt = require('jsonwebtoken');
const secret = 'keyboard cat';

const withAuth = function(req, res, next){
    const token = req.signedCookies.ssid;
    if (!token){ 
        res.status(400).send('Unauthorized: No token provided');
    } else {
        jwt.verify(token, secret, function(err, decoded){
            if (err){
                res.status(401).send('Unauthorized: Invalid token');
            } else {
                //console.log(token);
                req.email = decoded.email;
                next();
            }
        });
    }
}

module.exports = withAuth;