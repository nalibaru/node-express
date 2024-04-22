const { Pool } = require('pg');

const pool = new Pool({
    user: 'gopaganeshkrishnan',     // Your PostgreSQL username
    host: 'localhost',
    database: 'postgres', // Your PostgreSQL database name
    password: '1234', // Your PostgreSQL password
    port: 5432,               // Your PostgreSQL port (default is 5432)
  });

  module.exports = pool;