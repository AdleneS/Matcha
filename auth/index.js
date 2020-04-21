const express = require('express');
const router = express.Router();
const pool = require('../db');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'keyboard cat';
var moment = require('moment');

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

function validateRegistration(user){
	const validLogin = typeof user.login == 'string' && 
							user.login.trim() != '' &&
							user.login.trim().length >= 3;
	const validEmail = typeof user.email == 'string' && 
						user.email.trim() != '';
	const validBirthday = typeof user.birthday == 'string';
	const validPassword = typeof user.password == 'string' && 
						user.password.trim() != '' &&
						user.password.trim().length >= 3;
	const verifyPassword = user.password == user.verify_password;

	return {login: validLogin, email: validEmail, pass: validPassword, v_pass: verifyPassword, birthday: validBirthday};
}

router.post('/register', (req, res, next) => {
	
	const { login, email, password, birthday, gender, sexual_orientation } = req.body;
	var err = validateRegistration(req.body)
	if(err.email && err.pass && err.v_pass && err.login){
		pool.query('INSERT INTO users (login, email, password, date, birthday, gender, sexual_orientation) VALUES ($1, $2, $3, $4, $5, $6, $7)', [login, email, bcrypt.hashSync(password, 10), moment().format('YYYY/MM/DD'), moment(birthday,'YYYY/MM/DD'), gender.toLowerCase(), sexual_orientation.toLowerCase()], (error, results) => {
			if (error){
				res.status(401).json({error: error});
			} else {
				res.status(200).json({message: 'New User: ' + email});
			}
		});
	} else {
		if (!err.email)
			res.status(401).json({error: 'email'});
		if (!err.pass)
			res.status(401).json({error: 'pass'});
		if (!err.v_pass)
			res.status(401).json({error: 'v_pass'});
		if (!err.login)
			res.status(401).json({error: 'login'});
		if (!err.birthday)
			res.status(401).json({error: 'birthday'});
	}
});
module.exports = router;