const schedule = require('node-schedule');
const runMessagesJob = require('./MessageScheduler');
const runSlackBot = require('./SlackBot');
const ProjectUserService = use('App/Services/ProjectUserService');
const Logger = use('Logger');

const MESSAGES_JOB_SCHEDULE = '0 8 * * *';
const SLACK_BOT_SCHEDULE = '0 8 3 * *';
const COPY_TEAMLEADERS_JOB_SCHEDULE = '* 2 1 * *';

class SchedulerService {
  scheduleJobs() {
    schedule.scheduleJob(MESSAGES_JOB_SCHEDULE, runMessagesJob);
    schedule.scheduleJob(SLACK_BOT_SCHEDULE, runSlackBot);
    schedule.scheduleJob(COPY_TEAMLEADERS_JOB_SCHEDULE, () => {
      ProjectUserService.copyTeamLeadersFromLastMonth().catch(e => {
        Logger.error(e);
      });
    });
  }
}

module.exports = new SchedulerService();
