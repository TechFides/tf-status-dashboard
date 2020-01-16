require('dotenv').config({path: '../../.env'});

const {JWT} = require('google-auth-library');

let client;

async function initialization() {
  client = new JWT({
    email: process.env.GOOGLE_SERVICE_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: "https://www.googleapis.com/auth/admin.directory.user.readonly",
    subject: process.env.GOOGLE_ADMIN_EMAIL,
  });

  await client.authorize();
}

async function isUserExists(email) {
  const url = `https://www.googleapis.com/admin/directory/v1/users?domain=techfides.cz&query=email%3A${email}`;
  const res = await client.request({url});

  return !!res.data.users;
}

async function main() {
  await initialization();

  const emailQuery = 'david.smejkal@techfides.cz';
  const result = await isUserExists(emailQuery);
  console.log(result);
}

main().catch(console.error);
