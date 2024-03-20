const Pool = require("pg").Pool;
require('dotenv').config();

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const pool = new Pool({
    user: username,
    password: password,
    host: "localhost",
    port: 5432,
    database: "foodordering"
});

module.exports = pool;