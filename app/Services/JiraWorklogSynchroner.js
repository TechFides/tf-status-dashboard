'use strict';

const axios = require('axios');
const format = require('date-fns/format');

const Env = use('Env');
const UserModel = use('App/Models/User');
const ProjectModel = use('App/Models/Project');
const UserProjectParticipationModel = use('App/Models/UserProjectParticipation');

let options;
let UserIdMap = new Map();
let currentMonth, nextMonth;

class JiraWorklogSynchroner {
  initialization (startofMonth, endOfMonth) {
    currentMonth = startofMonth;
    nextMonth = endOfMonth;

    options = {
      method: 'GET',
      auth: { username: Env.get('ADMIN_EMAIL'), password: Env.get('JIRA_KEY') },
      headers: {
        'Accept': 'application/json',
      },
    };
  }

  async getUserFromJira (email) {
    const test = await axios.get(`https://techfides.atlassian.net/rest/api/2/user/search?username=${email}&fields=accountId`, options);
    return test;
  }

  async getProjectIssuesFromJira () {
    const startOfMonth = format(currentMonth, 'YYYY-MM-DD');
    const endOfMonth = format(nextMonth, 'YYYY-MM-DD');
    const MAX_RESULT = 1000;
    let startAt = 0;
    let allIssues = [];
    let issues;

    do {
      issues = await axios.get(
        `https://techfides.atlassian.net/rest/api/latest/search?jql=worklogDate>='${startOfMonth}'&worklogDate<'${endOfMonth}'&startAt=${startAt}&maxResults=${MAX_RESULT}&fields=id, key`, options);
      startAt += issues.data.maxResults;

      allIssues = [...allIssues, ...issues.data.issues];
    }
    while (issues.data.total > startAt);

    return allIssues;
  }

  async getWorklogsFromJira (issueId) {
    return await axios.get(`https://techfides.atlassian.net/rest/api/3/issue/${issueId}/worklog`, options);
  }

  async getAllWorklogsFromJira (issues) {
    let usersProject = [];
    let userObj;

    for (const issue of issues) {
      let worklogs = await this.getWorklogsFromJira(issue.id);
      let projectId = (await ProjectModel.query().where('code', '=', this.getProjectNameFromKey(issue.key)).fetch()).toJSON();
      projectId = projectId[0] ? projectId[0].id : null;

      for (const worklog of worklogs.data.worklogs) {
        if (this.isDateInThisMonth(worklog.updated)) {
          let isUser = usersProject.find(u => u.accountId === UserIdMap.get(worklog.author.accountId));

          if (isUser) {
            let userId = usersProject.findIndex(u => u.accountId === UserIdMap.get(worklog.author.accountId) && u.projectId === projectId);

            if (userId >= 0) {
              usersProject[userId].timeSpent += worklog.timeSpentSeconds;
            } else {
              userObj = {
                projectId: projectId,
                timeSpent: worklog.timeSpentSeconds,
                accountId: UserIdMap.get(worklog.author.accountId),
              };
              usersProject.push(userObj);
            }
          } else {
            userObj = {
              projectId: projectId,
              timeSpent: worklog.timeSpentSeconds,
              accountId: UserIdMap.get(worklog.author.accountId),
            };
            usersProject.push(userObj);
          }
        }
      }
    }
    await this.insertWorklogToDB(usersProject);
  }

  async cleanDB () {
    await UserProjectParticipationModel
      .query()
      .where('date', '=', currentMonth)
      .delete();
  }

  async insertWorklogToDB (usersProject) {
    for (const u of usersProject) {
      if (u.accountId && u.projectId) {
        await UserProjectParticipationModel
          .create({
            user_id: u.accountId,
            project_id: u.projectId,
            time_spent: u.timeSpent,
            date: currentMonth,
          });
      }
    }
  }

  async mapUserId () {
    const users = (await UserModel.query().fetch()).toJSON();
    let jiraUser;

    for (const user of users) {
      jiraUser = await this.getUserFromJira(user.email);
      if (jiraUser.data[0]) {
        UserIdMap.set(jiraUser.data[0].accountId, user.id);
      }
    }
  }

  isDateInThisMonth (dateToCompare) {
    const formattedDayToCompare = new Date(dateToCompare);

    return formattedDayToCompare >= currentMonth && formattedDayToCompare < nextMonth;
  };

  getProjectNameFromKey (projectKey) {
    return projectKey.split('-')[0];
  };

  async fetchJiraData (currentMonth, nextMonth) {
    let issues;
    this.initialization(currentMonth, nextMonth);

    this.cleanDB();

    issues = await this.getProjectIssuesFromJira();
    await this.mapUserId();

    await this.getAllWorklogsFromJira(issues);
  }
}

module.exports = new JiraWorklogSynchroner();
