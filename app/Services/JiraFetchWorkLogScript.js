const axios = require('axios');
const mysql = require('mysql');
const format = require('date-fns/format');

require('dotenv').config();

let options;
let connection;
let userMap = new Map();

function initialization() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });

  options = {
    method: 'GET',
    auth: { username: process.env.ADMIN_EMAIL, password: process.env.JIRA_KEY },
    headers: {
      'Accept': 'application/json',
    },
  };
}

async function getUserFromJira (email) {
  return await axios.get(`https://techfides.atlassian.net/rest/api/2/user/search?username=${email}`, options);
}

async function getProjectIssuesFromJira () {
  //const actualDate = format(new Date(), 'YYYY-MM-DD');
  const actualDate = '2019-12-01'
  const MAX_RESULT = 1000;
  let startAt = 0;
  let allIssues = [];
  let issues;

  do {
    issues = await axios.get(
      `https://techfides.atlassian.net/rest/api/latest/search?jql=worklogDate>'${actualDate}'&startAt=${startAt}&maxResults=${MAX_RESULT}`, options);
    startAt += issues.data.maxResults;

    allIssues = [...allIssues, ...issues.data.issues];
  }
  while (issues.data.total > startAt);

  return allIssues;
}

async function getWorklogsFromJira (issueId) {
  return await axios.get(`https://techfides.atlassian.net/rest/api/3/issue/${issueId}/worklog`, options);
}

async function getAllWorklogsFromJira (issues, jiraUserId) {
  let timeSpentSum = 0;
  let worklogMap = new Map();

  for (const issue of issues) {
    const worklogs = await getWorklogsFromJira(issue.id);

    for (const worklog of worklogs.data.worklogs) {
      if (worklog.author.accountId === jiraUserId && isDateInThisMonth(worklog.updated)) {
        timeSpentSum += worklog.timeSpentSeconds;
      }
    }
    if (timeSpentSum > 0) {
      let projectId = await fetchProjectFromDB(getProjectNameFromKey(issue.key));
      const worklogObj = {
        userId: userMap.get(jiraUserId),
        projectId: projectId[0] ? projectId[0].id : 999,
        timeSpent: timeSpentSum + isEmpty(worklogMap.get(getProjectNameFromKey(issue.key))),
      };
      worklogMap.set(getProjectNameFromKey(issue.key), worklogObj);
      timeSpentSum = 0;
    }
  }

  for (const [key, value] of worklogMap.entries()) {
    await insertWorklogToDB(value.userId, value.projectId, value.timeSpent);
  }

  worklogMap.clear();
}


function fetchUsersFromDB () {
  return new Promise(function(resolve, reject) {
    connection.query('SELECT email, id FROM users', (err, data) => (err ? reject(err) : resolve(data)));
  });
}

function fetchProjectFromDB (projectKey) {
  const project = {code: projectKey}

  return new Promise(function(resolve, reject) {
    connection.query('SELECT id FROM projects WHERE ?', project, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

function insertWorklogToDB (userId, projectId, timeSpent) {
  // TODO actualMonth is just temp variable, it would be better set date from UI
  const actualMonth = new Date();
  const worklog = {user_id: userId, project_id: projectId, time_spent: timeSpent, date: actualMonth};

  return new Promise(function(resolve, reject) {
    connection.query('INSERT INTO user_project_participations SET ?', worklog, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

async function mapUserId () {
  const users = await fetchUsersFromDB();
  let jiraUser;

  for (const user of users) {
    jiraUser = await getUserFromJira(user.email);
    if (jiraUser.data[0]) {
      userMap.set(jiraUser.data[0].accountId, user.id);
    }
  }
}

isEmpty = (worklog) => {
  return worklog === undefined ? 0 : worklog.timeSpent;
};

isDateInThisMonth = (dateToCompare) => {
  let date = new Date(2019, 11, 2);
  //date.setDate(1);
  const formattedDayToCompare = new Date(dateToCompare);

  return formattedDayToCompare >= date;
};

getProjectNameFromKey = (projectKey) => {
 return projectKey.split('-')[0];
};

async function main () {
  let issues;
  initialization();
  connection.connect();

  issues = await getProjectIssuesFromJira();
  await mapUserId();

  for (const key of userMap.keys()) {
    await getAllWorklogsFromJira(issues, key);
  }

  connection.end();
}

main().catch(console.error);
