const { WebClient } = require('@slack/web-api');
const mysql = require('mysql');
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

function fetchMeetings() {
  return new Promise(function (resolve, reject) {
    const query = 'SELECT id, time, week_day FROM meeting_times';
    connection.query(query, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

function fetchProjects(meetingTimeId) {
  return new Promise(function (resolve, reject) {
    const query = `SELECT code FROM projects where meeting_time_id=${meetingTimeId} AND is_active=1`;
    connection.query(query, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

function getChannelName(channelName) {
  return new Promise(function (resolve, reject) {
    const query = `SELECT value FROM system_params where \`key\`='${channelName}'`;
    connection.query(query, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

async function sendNotificationOfSitdown(slackChannel, time, projects) {
  try {
    await slackWebClient.chat.scheduleMessage({
      channel: slackChannel.value,
      text: transformProjectsToString(projects),
      post_at: time,
    });
  } catch (error) {
    const errorChannelName = await getChannelName(SYSTEM_PARAMS.SLACK_ERROR_CHANNEL);
    const attachments = [
      {
        color: '#c62828',
        text: `Jeejda, něco se porouchalo :exclamation: \n Chyba: *${error.data.error}*.`,
      },
    ];

    await slackWebClient.chat.postMessage({ channel: errorChannelName[0].value, attachments: attachments });
    console.error(error);
  }
}

function transformProjectsToString(projects) {
  let text;
  const stringOfProjects = projects
    .map(project => project.code)
    .sort()
    .join(', ');

  if (projects.length === 1) {
    text = `Za 15 minut začne sitdown pro projekt *${stringOfProjects}*. Připravte si, co jste za poslední týden dělali a co budete dělat následující týden.`;
  } else {
    text = `Za 15 minut začne sitdown pro projekty: *${stringOfProjects}*. Připravte si, co jste za poslední týden dělali a co budete dělat následující týden.`;
  }

  return text;
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

  return (
    (date.setHours(parseInt(separatedTime[0]), parseInt(separatedTime[1]), parseInt(separatedTime[2])) -
      quarterMinute) /
    1000
  );
}

async function main() {
  initialization();

  connection.connect();
  const meetingTimes = await fetchMeetings();
  const sitdownChannelName = await getChannelName(SYSTEM_PARAMS.SLACK_SITDOWN_CHANNEL);

  for (const projectsMeetingTime of meetingTimes) {
    const projects = await fetchProjects(projectsMeetingTime.id);
    if (projects.length) {
      let unixTimestamp = getUnixTimestamp(projectsMeetingTime.time, parseInt(projectsMeetingTime.week_day));
      if (unixTimestamp) {
        await sendNotificationOfSitdown(sitdownChannelName[0], unixTimestamp, projects);
      }
    }
  }
  connection.end();
}

main();
