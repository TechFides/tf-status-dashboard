const { WebClient } = require('@slack/web-api');
const mysql = require('mysql');
const format = require('date-fns/format');

require('dotenv').config();

let connection;
let slackWebClient;

function initialization() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });

  slackWebClient = new WebClient(process.env.SLACK_TOKEN);
}

function fetchUsersTimeSpent () {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(1);
  const previousMonth = format(date, 'YYYY-MM-DD');

  return new Promise(function(resolve, reject) {
    const query = `SELECT SUM(time_spent) AS timeSpentSum, user_id, users.email FROM user_project_participations, users WHERE user_id=users.id AND date='${previousMonth}' GROUP BY user_id`;
    connection.query(query, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

async function sendMessage(conversationId, timeSpentSum) {
  await slackWebClient.chat.postMessage({ channel: conversationId, text: `Hey bro za minulý měsíc si odpracoval ${getTimeSpentInHours(timeSpentSum)}h. Jen tak dál.` });
}

function getTimeSpentInHours(timeSpent) {
  const timeSpentInHours = timeSpent / 3600;

  return Math.round((timeSpentInHours + Number.EPSILON) * 100) / 100;
}

async function sendMessageToUsers(userId, timeSpentSum) {
  const { channel } = await slackWebClient.conversations.open({users: userId});
  await sendMessage(channel.id, timeSpentSum);
}

async function getUserSlackId(email) {
  return await slackWebClient.users.lookupByEmail({email: email});
}

async function main () {
  initialization();

  connection.connect();
  const dashboardUsers = await fetchUsersTimeSpent();
  connection.end();

  for (const dUser of dashboardUsers) {
    const userSlackId = await getUserSlackId(dUser.email);

    if (userSlackId) {
      await sendMessageToUsers(userSlackId.user.id, dUser.timeSpentSum);
    }
  }
}

main();

