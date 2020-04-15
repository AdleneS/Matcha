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
	const validEmail = typeof user.email == 'string' && 
						user.email.trim() != '';
	const validPassword = typeof user.password == 'string' && 
						user.password.trim() != '' &&
						user.password.trim().length >= 3;
	const verifyPassword = typeof user.password == typeof user.verify_password;

	return validEmail && validPassword && verifyPassword;
}

router.post('/register', (req, res, next) => {
	const { login, email, password, birthday, gender, sexual_orientation } = req.body;
	if(validateRegistration(req.body)){
		pool.query('SELECT * FROM users WHERE email = $1', [req.body.email], (error, results) => {
			if (error)
				throw error;
			else if (!results.rows[0]){
				pool.query('SELECT * FROM users WHERE login = $1', [req.body.login], (error, results) => {
					if (error)
						throw error;
					else if (!results.rows[0]){
						pool.query('INSERT INTO users (login, email, password, date, birthday, gender, sexual_orientation) VALUES ($1, $2, $3, $4, $5, $6, $7)', [login, email, bcrypt.hashSync(password, 10), moment().format('YYYY/MM/DD'), moment(birthday,'YYYY/MM/DD'), gender.toLowerCase(), sexual_orientation.toLowerCase()], (error, results) => {
							if (error){
								throw error;
							} else {
								res.status(200).json({message: 'New User: ' + email});
							}
						});
					} else {
						res.status(401).json({error: login + ' is already taken'});
					}
				});
			} else {
				res.status(401).json({error: email + ' is already taken'});
			}
		});
	} else {
		next(new Error('Invalid Information '));
	}
});
module.exports = router;