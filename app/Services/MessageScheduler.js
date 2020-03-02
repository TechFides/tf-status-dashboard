const { WebClient } = require('@slack/web-api');
const mysql = require('mysql');

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

function fetchProjectsMeetings () {
  return new Promise(function(resolve, reject) {
    const query = 'SELECT slack_channel_id, time, week_day FROM projects JOIN meeting_times ON projects.meeting_time_id = meeting_times.id';
    connection.query(query, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

async function sendNotificationOfStandup(slackChannel, time) {
  const text = 'Stand-up za 15 minut. Připravte si, co jste za poslední týden dělali a co budete dělat následující týden.';

  try {
    await slackWebClient.chat.scheduleMessage({ channel: slackChannel, text: text, post_at: time});
  } catch (error) {
    const attachments = [
      {
        color: '#c62828',
        text: `Jeejda, něco se porouchalo :exclamation: \n Chyba: \*${error.data.error}\*.`,
      },
    ];

    await slackWebClient.chat.postMessage({ channel: 'slackbot-errors', attachments: attachments });
    console.error(error);
  }
}

function getUnixTimestamp(time, weekDay) {
  const date = new Date();
  const quarterMinute = 900000;
  const separatedTime = time.split(':');
  const currentDay = date.getDay();

  weekDay = (weekDay + 1) % 7;

  if (currentDay !== weekDay) {
    return null;
  }

  const distance = weekDay - currentDay;
  date.setDate(date.getDate() + distance);

  return (date.setHours(parseInt(separatedTime[0]), parseInt(separatedTime[1]), parseInt(separatedTime[2])) - quarterMinute) / 1000;
}

async function main () {
  initialization();

  connection.connect();
  const projectsMeetings = await fetchProjectsMeetings();
  connection.end();

  for (const projectMeeting of projectsMeetings) {
    if (projectMeeting.slack_channel_id && projectMeeting.time) {

      let unixTimestamp = getUnixTimestamp(projectMeeting.time, parseInt(projectMeeting.week_day));
      if (unixTimestamp) {
        await sendNotificationOfStandup(projectMeeting.slack_channel_id, unixTimestamp);
      }
    }
  }
}

main();
