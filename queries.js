const pool = require('./db');
var bcrypt = require('bcrypt');
var moment = require('moment');

const getUsers = (request, response) => {

		pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
			if (error) {
				throw error
			}else{
								response.status(200).json(results.rows)
			}
		})
	}

	const getUsersImg = (request, response) => {
		pool.query('SELECT * FROM users INNER JOIN img ON img.uid = users.uid WHERE img.n_pic = 1 AND NOT users.uid = $1', [request.cookies.info.uid], (error, results) => {
			if (error) {
				throw error
			}else{
				response.status(200).json(results.rows)
			}
		})
	}

	const getLikes = (request, response) => {
		pool.query('SELECT * FROM likes WHERE uid_liker = $1', [request.cookies.info.uid], (error, results) => {
			if (error) {
				throw error
			}else{
				response.status(200).json(results.rows)
			}
		})
	}

	const getNotif = (request, response) => {
		const user_uid = request.cookies.info.uid;
		pool.query('SELECT * FROM notifications  WHERE notified_uid = $1 ORDER BY id DESC LIMIT 10' , [user_uid], (error, results) => {
			if (error) {
				throw error
			}else{
				response.status(200).json(results.rows)
			}
		})
	}
	const getNotifNb = (request, response) => {
		const user_uid = request.cookies.info.uid;
		pool.query('SELECT * FROM notifications WHERE notified_uid = $1 AND seen = false', [user_uid], (error, results) => {
			if (error) {
				throw error
			}else{
				response.status(200).json(results.rowCount)
			}
		})
	}
	const setNotifSeen = (request, response) => {
		const user_uid = request.cookies.info.uid;
		const notif_id = request.body.notif_id;
		pool.query('UPDATE notifications SET seen = true WHERE notified_uid = $1 AND seen = false and id = $2', [user_uid, notif_id], (error, results) => {
			if (error) {
				throw error
			}else{
				response.status(200)
			}
		})
	}
	const updateLocation = (request, response) => {
		const user_uid = request.cookies.info.uid;
		pool.query('UPDATE users SET country = $2 WHERE uid = $1', [user_uid, request.body.location], (error, results) => {
			if (error) {
				throw error
			}else{
				response.status(200)
			}
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
		pool.query('INSERT INTO users (login, email, password, date, birthday, gender, sexual_orientation) VALUES ($1, $2, $3, $4, $5, $6, $7)', [login, email, bcrypt.hashSync(password, 10), moment().format('YYYY/MM/DD'), moment(birthday,'YYYY/MM/DD'), gender.toLowerCase(), sexual_orientation.toLowerCase()], (error, results) => {
			if (error) {
				throw error
			}
			response.status(200).send(`User added with ID: ${login}`)
		})
	}

	
	const createNotif = (request, response) => {
		const { notified_uid, notifier_uid, notifier_login, notif_type } = request.body
		pool.query('INSERT INTO notifications (notified_uid, notifier_uid, notifier_login, notif_type, date) VALUES ($1, $2, $3, $4, $5)', [notified_uid, notifier_uid, notifier_login, notif_type, moment().format('YYYY/MM/DD')], (error, results) => {
			if (error){
				throw error
			} else {
				response.status(200).json({message: 'New Notif'});
			}
		});
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

	const createMatch = (request, response) => {
		const user_uid = request.cookies.info.uid;
		const pretender_uid = request.body.pretenderUid;
		pool.query('SELECT * FROM likes WHERE uid_liker = $1 AND uid_liked = $2', [pretender_uid, user_uid], (error, results) => {
			if (error){
				response
				.json({error: 'Bad Request'})
				.status(400)
			} else if (results.rows.length){
				pool.query('INSERT INTO match (uid_1, uid_2, date) VALUES ($1, $2, $3)', [user_uid, pretender_uid, moment().format('LLL')], (error, results) => {
					if (error){
						response.status(400)
					}
					response
					.json({info: 'match'})
					.status(200)
				})
			} else {
				response
				.json({ info: 'nothing'})
				.status(200)
			}
		});
	};

	const deleteMatch = (request, response) => {
		const user_uid = request.cookies.info.uid;
		const pretender_uid = request.body.pretenderUid;
		pool.query('SELECT * FROM match WHERE uid_1 = $1 AND uid_2 = $2 OR uid_1 = $2 AND uid_2 = $1', [user_uid, pretender_uid], (error, results) => {
			if (error){
				throw error;
			} else if (results.rows.length){
				pool.query('DELETE FROM match WHERE uid_1 = $1 AND uid_2 = $2 OR uid_1 = $2 AND uid_2 = $1', [user_uid, pretender_uid], (error, results) => {
					if (error){
						throw error
					}
					response
						.json({info: 'unmatch'})
						.status(200)
				});
			} else {
				response
					.json({info: "nothing"})
					.status(200)
			}
		});
	}
	const getMatch = (request, response) => {
		const user_uid = request.cookies.info.uid;
		pool.query('SELECT *\
					FROM match\
					INNER JOIN users ON match.uid_1 = users.uid\
					INNER JOIN img ON img.uid = match.uid_1\
					WHERE uid_2 = $1\
					UNION\
					SELECT *\
					FROM match\
					INNER JOIN users ON match.uid_2 = users.uid\
					INNER JOIN img ON img.uid = match.uid_2\
					WHERE uid_1 = $1', [user_uid], (error, results) => {
			if (error) {
				throw error
			}else{
				response.status(200).json(results.rows)
			}
		})
	}

	const like = (req, res) => {
		const liker = req.cookies.info.uid;
		const liked = req.body.likedUid;
		pool.query('SELECT * FROM likes WHERE uid_liker = $1 AND uid_liked = $2', [liker, liked], (error, results) => {
			if (error){
				throw error
			} else if (results.rows.length){
			 pool.query('DELETE FROM likes WHERE uid_liker = $1 AND uid_liked = $2', [liker, liked], (error, results) => {
				 if (error){
					res.status(400)
				 }
				 res
					.json({info: 'unlike'})
					.status(200)
			 });
			} else {
				pool.query('INSERT INTO likes (uid_liker, uid_liked) VALUES ($1, $2)', [liker, liked], (error, results) => {
					if (error){
						res.status(400)
					}
				res
				.json({ info: 'like'})
				.status(200)
				});
			}
		});
	};

	const getMessages = (request, response) => {
		console.log("wqdqwd", request.params)
		const	user_uid = request.cookies.info.uid
		const	match_uid = request.params.match_uid
		pool.query('SELECT * FROM chat WHERE (uid_sender = $1 AND uid_receiver = $2) OR (uid_sender = $2 AND uid_receiver = $1)', [user_uid, match_uid], (error, results) => {
			if (error) {
				throw error
			}
			if (results.rowCount)
				response.status(200).json(results.rows)
			else
				response.status(400)

		})
	}

	const createMessages = (request, response) => {
		console.log("wqdqwd", request.params)

		const	user_uid = request.cookies.info.uid
		const	match_uid = request.params.match_uid
		const	msg = request.body.msg
		pool.query('INSERT INTO chat (uid_sender, uid_receiver, msg, date) VALUES ($1, $2, $3, $4)', [user_uid, match_uid, msg, moment()], (error, results) => {
			if (error){
				throw error
			} else {
				response.status(200).json({message: 'Sent'});
			}
		});
	}

	module.exports = {
		pool,
		getUsers,
		getUsersImg,
		getLikes,
		getUserById,
		createUser,
		deleteUser,
		getUserByEmail,
		createNotif,
		getNotif,
		getNotifNb,
		setNotifSeen,
		updateLocation,
		createMatch,
		deleteMatch,
		like,
		getMatch,
		getMessages,
		createMessages,
	}