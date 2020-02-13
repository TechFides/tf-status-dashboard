'use strict';

const JiraWorklogSynchroner = use('App/Services/JiraWorklogSynchroner');
const UsersXpCounter = use('App/Services/UsersXpCounter');

class JiraController {
  async fetchData ({ request, response, params }) {
    let {month, year} = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month -1, 1);
    const nextMonth = new Date(year, month, 1);

    await JiraWorklogSynchroner.fetchJiraData(currentMonth, nextMonth);
    const projectStatistic = await UsersXpCounter.countUsersXp(currentMonth, nextMonth);
    await UsersXpCounter.setUserExperience(currentMonth, nextMonth, projectStatistic.userStatistics);

    return projectStatistic;
  }
}

module.exports = JiraController;
