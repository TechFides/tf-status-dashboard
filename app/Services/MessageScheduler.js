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

function fetchMeetings () {
  return new Promise(function(resolve, reject) {
    const query = 'SELECT id, time, week_day FROM meeting_times';
    connection.query(query, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

function fetchProjects (meetingTimeId) {
  return new Promise(function(resolve, reject) {
    const query = `SELECT code FROM projects where meeting_time_id=${meetingTimeId}`;
    connection.query(query, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

async function sendNotificationOfStandup(slackChannel, time, projects) {
  try {
    await slackWebClient.chat.scheduleMessage({ channel: slackChannel, text: transformProjectsToString(projects), post_at: time});
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

function transformProjectsToString (projects) {
  let stringOfProjects = [];
  let text = '';

  projects.forEach((project, index) => {
    stringOfProjects += `${project.code}`;
    if (index !== projects.length - 1) {
      stringOfProjects += ', ';
    }
  });

  if (projects.length === 1) {
    text = `Za 15 minut začne sitdown pro projekt \*${stringOfProjects}\*. Připravte si, co jste za poslední týden dělali a co budete dělat následující týden.`;
  } else {
    text = `Za 15 minut začne sitdown pro projekty: \*${stringOfProjects}\*. Připravte si, co jste za poslední týden dělali a co budete dělat následující týden.`;
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

  return (date.setHours(parseInt(separatedTime[0]), parseInt(separatedTime[1]), parseInt(separatedTime[2])) - quarterMinute) / 1000;
}

async function main () {
  initialization();

  connection.connect();
  const meetingTimes = await fetchMeetings();

  for (const projectsMeetingTime of meetingTimes) {
    const projects = await fetchProjects(projectsMeetingTime.id);
    if (projects.length) {
      let unixTimestamp = getUnixTimestamp(projectsMeetingTime.time, parseInt(projectsMeetingTime.week_day));
      if (unixTimestamp) {
        await sendNotificationOfStandup(process.env.SLACK_CHANNEL, unixTimestamp, projects);
      }
    }
  }
  connection.end();
}

main();
