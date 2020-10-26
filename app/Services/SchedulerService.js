const schedule = require('node-schedule');
const runMessagesJob = require('./MessageScheduler');
const runSlackBot = require('./SlackBot');

const MESSAGES_JOB_SCHEDULE = '0 8 * * *';
const SLACK_BOT_SCHEDULE = '0 8 3 * *';

class SchedulerService {
  scheduleJobs() {
    schedule.scheduleJob(MESSAGES_JOB_SCHEDULE, runMessagesJob);
    schedule.scheduleJob(SLACK_BOT_SCHEDULE, runSlackBot);
  }
}

module.exports = new SchedulerService();
