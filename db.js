const Pool = require('pg').Pool
const pool = new Pool({
	user: 'asaba',
	host: 'localhost',
	database: 'matcha',
	password: 'root',
	port: 5432,
})

pool.connect()
tu es une pute
module.exports = pool
