const pool = require('./db');
var bcrypt = require('bcrypt');
var moment = require('moment');

const getUsers = (request, response) => {
		pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
			if (error) {
				throw error
			}else
				response.status(200).json(results.rows)
		})
	}

	const getUserById = (request, response) => {
		const id = parseInt(request.params.id)
	
		pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
			if (error) {
				getUserByEmail(request, response)
			}else{
				response.status(200).json(results.rows)
			}
		})
	}

	const getUserByEmail = (request, response) => {
		//const email = request.params.id
		//if (email == undefined)
		const	email = request.params.id
		pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
			if (error) {
				throw error
			}
			response.status(200).json(results.rows)
		})
	}

	const createUser = (request, response) => {
		const { login, email, password, birthday, gender, sexual_orientation } = request.body
		console.log(request.body);
		pool.query('INSERT INTO users (login, email, password, date, birthday, gender, sexual_orientation) VALUES ($1, $2, $3, $4, $5, $6, $7)', [login, email, bcrypt.hashSync(password, 10), moment().format('YYYY/MM/DD'), moment(birthday,'YYYY/MM/DD'), gender.toLowerCase(), sexual_orientation.toLowerCase()], (error, results) => {
			if (error) {
				throw error
			}
			response.status(200).send(`User added with ID: ${login}`)
		})
	}

	const updateUser = (request, response) => {
		const id = parseInt(request.params.id)
		const { name, email } = request.body
	
		pool.query(
			'UPDATE users SET name = $1, email = $2 WHERE id = $3',
			[name, email, id],
			(error, results) => {
				if (error) {
					throw error
				}
				response.status(200).send(`User modified with ID: ${id}`)
			}
		)
	}

	const deleteUser = (request, response) => {
		const id = parseInt(request.params.id)
	
		pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
			if (error) {
				throw error
			}
			response.status(200).send(`User deleted with ID: ${id}`)
		})
	}

	module.exports = {
		pool,
		getUsers,
		getUserById,
		createUser,
		updateUser,
		deleteUser,
		getUserByEmail,
	}