const mysql = require('mysql');
const { JWT } = require('google-auth-library');

require('dotenv').config();

let client;
let connection;
let usersEmail;

function initialization() {
  client = new JWT({
    email: process.env.GOOGLE_SERVICE_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: "https://www.googleapis.com/auth/admin.directory.user.readonly",
    subject: process.env.GOOGLE_ADMIN_EMAIL,
  });

  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });
}

async function isUserExists(email) {
  const url = `https://www.googleapis.com/admin/directory/v1/users?domain=techfides.cz&query=email%3A${email}`;
  const res = await client.request({url});

  return !!res.data.users;
}

function fetchUsersEmail () {
  return new Promise(function(resolve, reject) {
    connection.query('SELECT email FROM users', (err, data) => (err ? reject(err) : resolve(data)));
  });
}

function deleteUser (email) {
  return new Promise(function(resolve, reject) {
    connection.query(`DELETE FROM users WHERE email = "${email}" or email IS NULL`, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

async function synchronizeAccounts () {
  await client.authorize();

  for (const user of usersEmail) {
    if (!await isUserExists(user.email)) {
      await deleteUser(user.email);
    }
  }
}

async function main() {
  initialization();

  connection.connect();

  usersEmail = await fetchUsersEmail();
  await synchronizeAccounts();

  connection.end();
}

main().catch(console.error);
