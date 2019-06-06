'use strict';

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const Schedule = require('node-schedule');
const format = require('date-fns/format');

const Env = use('Env');
const UserModel = use('App/Models/User');
const HeatmapWeekModel = use('App/Models/HeatmapWeek');
const SystemParamModel = use('App/Models/SystemParam');

class FeedbackSchedulerService {
  static getFeedbackOptions (heatmapWeekId) {
    const feedbackOptions = [
      { text: 'ÚŽASNÝ', type: 'amazing', id: 1 },
      { text: 'DOBRÝ', type: 'good', id: 2 },
      { text: 'ŠPATNÝ', type: 'bad', id: 3 },
      { text: 'HROZNÝ', type: 'horrible', id: 4 },
    ];
    return feedbackOptions.map(option => ({
      ...option,
      feedbackUrl: Env.get('NODE_ENV') === 'development'
        ? `http://localhost:3333/submit-feedback?heatmapWeekId=${heatmapWeekId}&feedbackEnumId=${option.id}`
        : `https://projects.status.techfides.cz/submit-feedback?heatmapWeekId=${heatmapWeekId}&feedbackEnumId=${option.id}`,
    }));
  }

  static loadEmailTemplate () {
    const html = fs.readFileSync(path.resolve(__dirname, '../../assets/feedback-email-template.html'), 'utf-8');
    return Handlebars.compile(html);
  }

  static async getUserEmailAddresses () {
    const users = await UserModel.query().select('email').whereNotNull('email').fetch();
    return users.toJSON().map(item => item.email);
  }

  static async getFeedbackCrontab () {
    const feedbackCrontab = await SystemParamModel.findOrCreate(
      { key: 'feedbackCrontab' },
      { key: 'feedbackCrontab', value: '30 9 * * 1', type: 1 }, // default feedback crontab: every MONDAY at 9:30
    );
    return feedbackCrontab.value;
  }

  static getCurrentWeekBoundaries () {
    const now = new Date();
    const start = now.getDate() - now.getDay() + 1;
    const end = start + 7;
    const monday = new Date(now.setDate(start));
    const sunday = new Date(now.setDate(end));

    monday.setHours(0, 0, 0, 0);
    sunday.setHours(23, 59, 59, 0);

    return [monday, sunday];
  }

  constructor () {
    this.job = null;
    this.logger = use('Logger');
    this.emailService = use('App/Services/Email');
    this.template = FeedbackSchedulerService.loadEmailTemplate();
  }

  async schedule () {
    this.cancel();

    const rule = await FeedbackSchedulerService.getFeedbackCrontab();

    this.job = Schedule.scheduleJob(
      'feedback_email_job',
      rule,
      async () => {
        const toAddresses = await FeedbackSchedulerService.getUserEmailAddresses();

        const week = FeedbackSchedulerService.getCurrentWeekBoundaries();
        const heatmapWeek = await HeatmapWeekModel.findOrCreate(
          function () {
            this.where('date', '>=', week[0]);
            this.where('date', '<=', week[1]);
          },
          { date: week[0] },
        );

        const data = {
          feedbackOptions: FeedbackSchedulerService.getFeedbackOptions(heatmapWeek.id),
          week: { number: heatmapWeek.id, from: format(week[0], 'DD/MM/YYYY'), to: format(week[1], 'DD/MM/YYYY') },
        };

        this.emailService.sendEmail({
          toAddresses,
          html: this.template(data),
          text: `Týdenní zpětná vazba #${data.week.number}`,
          subject: `Týdenní zpětná vazba #${data.week.number}`,
        });
        this.logger.debug('Feedback scheduler: feedback email has been sent to every employee');
      },
    );
    this.logger.debug('FeedbackScheduler: new feedback job has been scheduled');
  }

  cancel () {
    if (this.job) {
      this.job.cancel();
      this.logger.debug('Feedback scheduler: scheduled feedback job has been canceled');
    }
  }
}

module.exports = new FeedbackSchedulerService();
