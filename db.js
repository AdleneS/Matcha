const Pool = require('pg').Pool
const pool = new Pool({
	user: 'asaba',
	host: 'localhost',
	database: 'matcha',
	password: 'root',
	port: 5432,
})

pool.connect()

module.exports = pool