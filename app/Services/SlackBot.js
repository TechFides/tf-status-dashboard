const { WebClient } = require('@slack/web-api');
const mysql = require('mysql');
const format = require('date-fns/format');
const { SYSTEM_PARAMS } = require('../../constants');

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

function fetchUsersTimeSpent() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(1);
  const previousMonth = format(date, 'YYYY-MM-DD');

  return new Promise(function (resolve, reject) {
    const columns = ['user_project_participations.time_spent', 'user_project_participations.user_id', 'users.email'];
    const tables = ['user_project_participations', 'users'];
    const query =
      'SELECT SUM(??) AS timeSpentSum, ??, ?? FROM ?? WHERE user_id = users.id AND date = ? GROUP BY user_id';
    connection.query(query, [columns[0], columns[1], columns[2], tables, previousMonth], (err, data) =>
      err ? reject(err) : resolve(data),
    );
  });
}

function getChannelName(channelName) {
  return new Promise(function (resolve, reject) {
    const query = `SELECT value FROM system_params where \`key\`='${channelName}'`;
    connection.query(query, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

async function sendMessage(conversationId, timeSpentSum) {
  const attachments = [
    {
      color: '#0091EA',
      pretext: `Za minulý měsíc máš zalogováno *${getTimeSpentInHours(timeSpentSum)}h*, souhlasí to?`,
      title: 'Dashboard',
      title_link: `${process.env.VUE_APP_URL}/statistics`,
      image_url: `${process.env.VUE_APP_URL}/images/techfides_logo.png`,
    },
  ];

  await slackWebClient.chat.postMessage({ channel: conversationId, attachments: attachments });
}

function getTimeSpentInHours(timeSpent) {
  const timeSpentInHours = timeSpent / 3600;

  return Math.round((timeSpentInHours + Number.EPSILON) * 100) / 100;
}

async function sendMessageToUsers(userId, timeSpentSum) {
  const { channel } = await slackWebClient.conversations.open({ users: userId });
  await sendMessage(channel.id, timeSpentSum);
}

async function getUserSlackId(email) {
  return await slackWebClient.users.lookupByEmail({ email: email });
}

async function run() {
  initialization();

  connection.connect();
  const dashboardUsers = await fetchUsersTimeSpent();

  for (const dUser of dashboardUsers) {
    try {
      const userSlackId = await getUserSlackId(dUser.email);
      if (userSlackId) {
        await sendMessageToUsers(userSlackId.user.id, dUser.timeSpentSum);
      }
    } catch (error) {
      const errorChannelName = await getChannelName(SYSTEM_PARAMS.SLACK_ERROR_CHANNEL);
      const attachments = [
        {
          color: '#c62828',
          text: `Jeejda, u uživatele *${dUser.email}* se něco porouchalo :exclamation: \n Chyba: *${error.data.error}*.`,
        },
      ];

      await slackWebClient.chat.postMessage({ channel: errorChannelName[0].value, attachments: attachments });
      console.error(error);
    }
  }
  connection.end();
}

module.exports = run;
