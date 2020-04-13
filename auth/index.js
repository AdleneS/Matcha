const express = require('express');
const router = express.Router();
const pool = require('../db');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'keyboard cat';

router.get('/', (req, res) => {
	res.json({
		message: 'Lock'
	});
});

function validateUser(user){
	const validEmail = typeof user.email == 'string' && 
						user.email.trim() != '';
	const validPassword = typeof user.password == 'string' && 
						user.password.trim() != '' &&
						user.password.trim().length >= 3;

	return validEmail && validPassword;
}

router.post('/signup', (req, res, next) => {
	if(validateUser(req.body)){
		pool.query('SELECT * FROM users WHERE email = $1', [req.body.email], (error, results) => {
			if (error)
				throw error;
			else if (results.rows[0]){
					if (bcrypt.compareSync(req.body.password, results.rows[0].password)){
						const email = results.rows[0].email;
						const payload = { email };
						const token = jwt.sign(payload, secret, {
							expiresIn: '2h'
						});
						res.cookie('ssid', token, { httpOnly: true })
							.json({ message:'Logged !'})
							.status(200);
					} else {
						res.status(401)
							.json({
						error: 'Incorrect password'
					});
				}
			} else {
				res.status(401)
				.json({
				error: 'Incorrect email'});
			}
		});
	} else {
		next(new Error('Invalid Users ' + req.body.password));
	}
});

module.exports = router;