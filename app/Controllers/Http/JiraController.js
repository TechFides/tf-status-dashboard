'use strict';

const format = require('date-fns/format');

const JiraWorklogSynchroner = use('App/Services/JiraWorklogSynchroner');
const JiraSynchronizationModel = use('App/Models/JiraSynchronization');

class JiraController {
  static millisToMinutesAndSeconds(millis) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return (minutes > 0 ? minutes + 'm ' : '') + (seconds < 10 ? '0' : '') + seconds + 's';
  }

  async fetchData ({ request, response, params }) {
    let {month, year} = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month -1, 1);
    const nextMonth = new Date(year, month, 1);

    const jiraSyncData = (await JiraSynchronizationModel
      .query()
      .orderBy('start_date', 'desc')
      .fetch()).toJSON();

    const syncDuration = new Date(jiraSyncData[0].finish_date) - new Date(jiraSyncData[0].start_date);

    const syncDates = {
      startSyncDate: format(new Date(), 'HH:mm:ss'),
      lastDuration: JiraController.millisToMinutesAndSeconds(syncDuration),
    };

    JiraWorklogSynchroner.fetchJiraData(currentMonth, nextMonth);

    return syncDates;
  }
}

module.exports = JiraController;
