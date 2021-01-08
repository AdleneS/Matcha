const pool = require('./db');
var moment = require('moment');

const updateLogin = (request, response) => {


	pool.query('SELECT * FROM users WHERE uid = $1', [request.signedCookies.info.uid], (error, user_log) => {
		if (error) {
			throw error
		}

		if (request.body.name && request.body.name != user_log.rows[0].name) {
			pool.query('UPDATE users SET name = $1 WHERE uid = $2', [request.body.name, request.signedCookies.info.uid], (error, results) => {
				if (error) {
					throw error
				}
			})
		}

		if (request.body.surname && request.body.surname != user_log.rows[0].firstname) {
			pool.query('UPDATE users SET firstname = $1 WHERE uid = $2', [request.body.surname, request.signedCookies.info.uid], (error, results) => {
				if (error) {
					throw error
				}
			})
		}
	 
		if (request.body.login && request.body.login != user_log[0].rows.login) {
			pool.query('SELECT * FROM users WHERE login = $1', [request.body.login], (error, check_login) => {
				console.log('test_col', request.body.login)
				if (error) {
					throw error
				} else {
					if (check_login.rowCount === 0) {
						pool.query('UPDATE users SET login = $1 WHERE uid = $2', [request.body.login, request.signedCookies.info.uid], (error, results) => {
							if (error) {
								throw error
							}
						})
					}
				}
			});
		}
	 
		if (request.body.email && request.body.email !=  user_log.rows[0].login) {
			pool.query('SELECT * FROM users WHERE email = $1', [request.body.email], (error, check_email) => {
				if (error) {
					throw error
				} else {
					if (check_email.rowCount === 0) {
						pool.query('UPDATE users SET email = $1 WHERE uid = $2', [request.body.email, request.signedCookies.info.uid], (error, results) => {
							if (error) {
								throw error
							}
						})
					}
				}
			});
		}

		if (request.body.birthday && moment(request.body.birthday, 'YYYY/MM/DD') != user_log.rows[0].birthday) {
		   pool.query('UPDATE users SET birthday = $1 WHERE uid = $2', [moment(request.body.birthday, 'YYYY/MM/DD'), request.signedCookies.info.uid], (error, results) => {
			   if (error) {
				   throw error
			   }
		   })
		}

		if (request.body.gender && request.body.gender.toLowerCase() != user_log.rows[0].gender) {
			pool.query('UPDATE users SET gender = $1 WHERE uid = $2', [request.body.gender.toLowerCase(), request.signedCookies.info.uid], (error, results) => {
				if (error) {
					throw error
				}
			})
		 }

		if (request.body.sexual_orientation && request.body.sexual_orientation.toLowerCase() != user_log.rows[0].sexual_orientation) {
		   pool.query('UPDATE users SET sexual_orientation = $1 WHERE uid = $2', [request.body.sexual_orientation.toLowerCase(), request.signedCookies.info.uid], (error, results) => {
			   if (error) {
				   throw error
			   }
		   })
		}

		if (request.body.description && request.body.description != user_log.rows[0].description) {
		   pool.query('UPDATE users SET description = $1 WHERE uid = $2', [request.body.description, request.signedCookies.info.uid], (error, results) => {
			   if (error) {
				   throw error
			   }
		   })
		}

		if (request.body.addTag) {
			var word = request.body.addTag.split(' ')
			for (let i = 0; word[i]; i++) {
				 pool.query('INSERT INTO tag(uid, tag) VALUES ($1, $2)', [request.signedCookies.info.uid, word[i]], (error, results) => {
					if (error) {
						response.status(400)
					}
				})
			}
		}
	 
	})

	if (response) {
		response.json({info: "success"})
		.status(200)
	} else {
		response.json({info: "this email is already used"})
		.status(400)
	}
}

const sortTags = (request, response) => {
	pool.query('SELECT * FROM tag WHERE uid = $1', [request.signedCookies.info.uid], (error, results) => {
		if (error) {
			throw error;
		}else{
			response.status(200).json(results.rows)
		}
	})
}

const deleteTag = (request, response) => {
	pool.query('DELETE FROM tag WHERE uid = $1 AND tag = $2', [request.signedCookies.info.uid, request.body.tag], (error, results) => {
		if (error) {
			throw error;
		}else{
			response.status(200).json(results.rows)
		}
	})
}

const sortImage = (request, response) => {
	pool.query('SELECT * FROM img WHERE uid = $1', [request.signedCookies.info.uid], (error, results) => {
		if (error) {
			throw error;
		}else{
			response.status(200).json(results.rows)
		}
	})

}

const deleteImage = (request, response) => {
	pool.query('DELETE FROM img WHERE uid = $1 AND n_pic = $2', [request.signedCookies.info.uid, request.body.img], (error, results) => {
		if (error) {
			throw error;
		}else{
			response.status(200).json(results.rows)
		}
	})

}


//const imgUpload = (req, res) => {
//    console.log('TESTe')
//    const tempPath = req.file.path;
//    const targetPath = "./client/public/img_container/" + req.file.fieldname + '-' + Date.now() + path.extname(req.file.originalname);
//    if (path.extname(req.file.originalname).toLowerCase() === ".png" || ".jpg") {
//        fs.rename(tempPath, targetPath, err => {
//            if (err) return handleError(err, res);
//            
//            pool.query('SELECT * FROM img WHERE uid = $1', [req.signedCookies.info.uid], (error, check_img) => {
//                //if (error) throw error;
//                if (check_img.rowCount < 5) {
//                    pool.query('INSERT INTO img (path, uid, n_pic) VALUES ($1, $2, $3)', [targetPath.slice(15), req.signedCookies.info.uid, check_img.rowCount + 1], (error, results) => {
//
//                        //if (error) throw error;});
//                    });
//                    res
//                        .status(200)
//                        .json({ info: 'File uploaded!' })
//                }
//            });
//
//        });
//    } else {
//            fs.unlink(tempPath, err => {
//            if (err) return handleError(err, res);
//
//            res
//                .status(403)
//        .json({ info: "Only .png and .jpg files are allowed!" })
//        });
//    }
//}

module.exports = {
	updateLogin,
	sortTags,
	deleteTag,
	sortImage,
	deleteImage
}