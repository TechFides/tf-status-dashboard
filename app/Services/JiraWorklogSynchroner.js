'use strict';

const axios = require('axios');
const format = require('date-fns/format');

const Env = use('Env');
const UserModel = use('App/Models/User');
const ProjectModel = use('App/Models/Project');
const UserProjectParticipationModel = use('App/Models/UserProjectParticipation');
const JiraSynchronizationModel = use('App/Models/JiraSynchronization');
const UsersXpCounter = use('App/Services/UsersXpCounter');
const Logger = use('Logger');

let options;
let UserIdMap = new Map();
let currentMonth, nextMonth;

class JiraWorklogSynchroner {
  initialization(startofMonth, endOfMonth) {
    currentMonth = startofMonth;
    nextMonth = endOfMonth;

    options = {
      method: 'GET',
      auth: { username: Env.get('JIRA_ADMIN_EMAIL'), password: Env.get('JIRA_KEY') },
      headers: {
        Accept: 'application/json',
      },
    };
  }

  async getUserFromJira(email) {
    return await axios.get(
      `https://techfides.atlassian.net/rest/api/3/user/search?query=${email}&fields=accountId`,
      options,
    );
  }

  async getProjectIssuesFromJira() {
    const startOfMonth = format(currentMonth, 'YYYY-MM-DD');
    const endOfMonth = format(nextMonth, 'YYYY-MM-DD');
    const MAX_RESULT = 100;
    let startAt = 0;
    let allIssues = [];
    let issues;

    do {
      issues = await axios.get(
        `https://techfides.atlassian.net/rest/api/latest/search?jql=worklogDate>='${startOfMonth}'&worklogDate<'${endOfMonth}'&startAt=${startAt}&maxResults=${MAX_RESULT}`,
        options,
      );
      startAt += issues.data.maxResults;

      allIssues = [...allIssues, ...issues.data.issues];
    } while (issues.data.total > startAt);

    Logger.info(
      `Fetched  ${allIssues.length} issues from jira for: https://techfides.atlassian.net/rest/api/latest/search?jql=worklogDate>='${startOfMonth}'&worklogDate<'${endOfMonth}'`,
    );
    return allIssues;
  }

  async getWorklogsFromJira(issueId) {
    return await axios.get(`https://techfides.atlassian.net/rest/api/3/issue/${issueId}/worklog`, options);
  }

  async getProjectId(issue) {
    let project = null;

    if (issue.fields.labels.length > 0) {
      for (const label of issue.fields.labels) {
        project = (await ProjectModel.query().where('code', '=', label).fetch()).toJSON();
        if (project[0]) {
          return project[0].id;
        }
      }
    }

    project = (await ProjectModel.query().where('code', '=', issue.fields.project.key).fetch()).toJSON();
    return project[0] ? project[0].id : null;
  }

  async getAllWorklogsFromJira(issues) {
    let usersProject = [];
    let userObj;

    for (const issue of issues) {
      let worklogs = await this.getWorklogsFromJira(issue.id);
      let projectId = await this.getProjectId(issue);

      for (const worklog of worklogs.data.worklogs) {
        if (this.isDateInThisMonth(worklog.started)) {
          let isUser = usersProject.find(u => u.userId === UserIdMap.get(worklog.author.accountId));

          if (isUser) {
            let userIndex = usersProject.findIndex(
              u => u.userId === UserIdMap.get(worklog.author.accountId) && u.projectId === projectId,
            );

            if (userIndex >= 0) {
              usersProject[userIndex].timeSpent += worklog.timeSpentSeconds;
            } else {
              userObj = {
                projectId: projectId,
                timeSpent: worklog.timeSpentSeconds,
                userId: UserIdMap.get(worklog.author.accountId),
              };
              usersProject.push(userObj);
            }
          } else {
            userObj = {
              projectId: projectId,
              timeSpent: worklog.timeSpentSeconds,
              userId: UserIdMap.get(worklog.author.accountId),
            };
            usersProject.push(userObj);
          }
        }
      }
    }
    Logger.info('Fetched worklog time spends');
    Logger.info(JSON.stringify(usersProject, null, 2));
    await this.insertWorklogToDB(usersProject);
  }

  async cleanDB() {
    await UserProjectParticipationModel.query().where('date', '=', currentMonth).delete();
  }

  async insertWorklogToDB(usersProject) {
    for (const u of usersProject) {
      if (u.userId && u.projectId) {
        await UserProjectParticipationModel.create({
          user_id: u.userId,
          project_id: u.projectId,
          time_spent: u.timeSpent,
          date: currentMonth,
        });
      }
    }
  }

  async mapUserId() {
    const users = (await UserModel.query().fetch()).toJSON();
    let jiraUser;

    for (const user of users) {
      try {
        jiraUser = await this.getUserFromJira(user.email);
      } catch (e) {
        Logger.error('Can not get user from jira for email: ' + user.email);
        Logger.error(JSON.stringify(e, null, 2));
        continue;
      }

      if (jiraUser.data[0]) {
        UserIdMap.set(jiraUser.data[0].accountId, user.id);
      }
    }

    Logger.info('UserID <> Jira accont id map');
    Logger.info(UserIdMap);
  }

  isDateInThisMonth(dateToCompare) {
    const formattedDayToCompare = new Date(dateToCompare);

    return formattedDayToCompare >= currentMonth && formattedDayToCompare < nextMonth;
  }

  async setSynchronizationStatus(error = null) {
    const date = new Date();
    let errorStatus;
    let message;

    if (error) {
      errorStatus = error.response ? error.response.status : 500;
      message = error.response ? error.response.data.errorMessages[0] : error.message;
    }

    const jiraSynchronization = await JiraSynchronizationModel.findBy('status', 1);
    const jiraSynchronizationDetail = {
      status: 0,
      error: errorStatus,
      message: message,
      finish_date: date,
    };

    if (jiraSynchronization) {
      jiraSynchronization.merge(jiraSynchronizationDetail);
      await jiraSynchronization.save();
    } else {
      await JiraSynchronizationModel.create({
        status: 1,
        start_date: date,
      });
    }
  }

  async fetchJiraData(currentMonth, nextMonth) {
    try {
      let issues;

      await this.setSynchronizationStatus();

      this.initialization(currentMonth, nextMonth);

      await this.cleanDB();

      issues = await this.getProjectIssuesFromJira();
      await this.mapUserId();
      await this.getAllWorklogsFromJira(issues);

      const projectStatistic = await UsersXpCounter.countUsersXp(currentMonth, nextMonth);
      await UsersXpCounter.setUserExperience(currentMonth, nextMonth, projectStatistic.userStatistics);

      await this.setSynchronizationStatus();
    } catch (e) {
      console.error(e);
      await this.setSynchronizationStatus(e);
    }
  }
}

module.exports = new JiraWorklogSynchroner();
