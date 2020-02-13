'use strict';

const axios = require('axios');
const format = require('date-fns/format');

const Env = use('Env');
const UserModel = use('App/Models/User');
const ProjectModel = use('App/Models/Project');
const UserProjectParticipationModel = use('App/Models/UserProjectParticipation');

let options;
let userMap = new Map();
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

  async getAllWorklogsFromJira (issues, jiraUserId) {
    let timeSpentSum = 0;
    let worklogMap = new Map();

    for (const issue of issues) {
      const worklogs = await this.getWorklogsFromJira(issue.id);

      for (const worklog of worklogs.data.worklogs) {
        if (worklog.author.accountId === jiraUserId && this.isDateInThisMonth(worklog.updated)) {
          timeSpentSum += worklog.timeSpentSeconds;
        }
      }
      if (timeSpentSum > 0) {
        let projectId = (await ProjectModel.query().where('code', '=', this.getProjectNameFromKey(issue.key)).fetch()).toJSON();
        const worklogObj = {
          userId: userMap.get(jiraUserId),
          projectId: projectId[0] ? projectId[0].id : 999,
          timeSpent: timeSpentSum + this.isEmpty(worklogMap.get(this.getProjectNameFromKey(issue.key))),
        };
        worklogMap.set(this.getProjectNameFromKey(issue.key), worklogObj);
        timeSpentSum = 0;
      }
    }

    for (const [key, value] of worklogMap.entries()) {
      await this.insertWorklogToDB(value.userId, value.projectId, value.timeSpent);
    }

    worklogMap.clear();
  }

  async cleanDB () {
    await UserProjectParticipationModel
      .query()
      .where('date', '=', currentMonth)
      .delete();
  }

  async insertWorklogToDB (userId, projectId, timeSpent) {
    await UserProjectParticipationModel
      .create({
        user_id: userId,
        project_id: projectId,
        time_spent: timeSpent,
        date: currentMonth,
      });
  }

  async mapUserId () {
    const users = (await UserModel.query().fetch()).toJSON();
    let jiraUser;

    for (const user of users) {
      jiraUser = await this.getUserFromJira(user.email);
      if (jiraUser.data[0]) {
        userMap.set(jiraUser.data[0].accountId, user.id);
      }
    }
  }

  isEmpty (worklog) {
    return worklog ? worklog.timeSpent : 0;
  };

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

    for (const key of userMap.keys()) {
      await this.getAllWorklogsFromJira(issues, key);
    }
  }
}

module.exports = new JiraWorklogSynchroner();
