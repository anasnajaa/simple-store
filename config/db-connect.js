require('dotenv').config();
module.exports = {
    client: 'pg',
    connection: {
      host : process.env.DB_IP,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB,
      max: 10,
      idleTimeoutMillis: 30000,
      ssl: true
    }
}