'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Handlebars = require('handlebars');
const Schedule = require('node-schedule');
const format = require('date-fns/format');
const { SYSTEM_PARAMS } = require('../../constants');

const Env = use('Env');
const Logger = use('Logger');
const EmailService = use('App/Services/Email');
const UserModel = use('App/Models/User');
const HeatmapWeekModel = use('App/Models/HeatmapWeek');
const SystemParamModel = use('App/Models/SystemParam');
const FeedbackTokenModel = use('App/Models/FeedbackToken');

class FeedbackSchedulerService {
  static getFeedbackOptions (token) {
    const feedbackOptions = [
      { text: 'ÚŽASNÝ', type: 'amazing', id: 1 },
      { text: 'DOBRÝ', type: 'good', id: 2 },
      { text: 'ŠPATNÝ', type: 'bad', id: 3 },
      { text: 'HROZNÝ', type: 'horrible', id: 4 },
    ];
    const vueAppUrl = Env.get('VUE_APP_URL');
    return feedbackOptions.map(option => ({
      ...option,
      feedbackUrl: `${vueAppUrl}/submit-feedback?token=${token}&feedbackEnumId=${option.id}`,
      feedbackImageUrl: `${vueAppUrl}/images/rating-${option.type}.png`,
    }));
  }

  static loadEmailTemplate () {
    const html = fs.readFileSync(path.resolve(__dirname, '../../assets/email-templates/feedback.html'), 'utf-8');
    return Handlebars.compile(html);
  }

  static async getUsersWithEmailAddress () {
    const users = await UserModel.query().whereNotNull('email').fetch();
    return users.toJSON();
  }

  static async expireAllFeedbackTokens () {
    return await FeedbackTokenModel.query().update({ expired: true });
  }

  static async getFeedbackCrontab () {
    const feedbackCrontab = await SystemParamModel.find(SYSTEM_PARAMS.FEEDBACK_CRONTAB);
    return feedbackCrontab.value;
  }

  static getCurrentWeekBoundaries () {
    const now = new Date();
    const start = now.getDate() - now.getDay() + 1;
    const end = start + 6;
    const monday = new Date(now.setDate(start));
    const sunday = new Date(now.setDate(end));

    monday.setHours(0, 0, 0, 0);
    sunday.setHours(23, 59, 59, 0);

    return [monday, sunday];
  }

  constructor () {
    this.job = null;
    this.template = FeedbackSchedulerService.loadEmailTemplate();
  }

  async schedule () {
    this.cancel();

    const crontab = await FeedbackSchedulerService.getFeedbackCrontab();

    this.job = Schedule.scheduleJob(
      'feedback_email_job',
      crontab,
      async () => {
        await FeedbackSchedulerService.expireAllFeedbackTokens();

        const users = await FeedbackSchedulerService.getUsersWithEmailAddress();
        const week = FeedbackSchedulerService.getCurrentWeekBoundaries();
        const heatmapWeek = await HeatmapWeekModel.findOrCreate(
          function () {
            this.where('date', '>=', week[0]);
            this.where('date', '<=', week[1]);
          },
          { date: week[0] },
        );

        const weekData = {
          number: heatmapWeek.id,
          from: format(week[0], 'DD/MM/YYYY'),
          to: format(week[1], 'DD/MM/YYYY'),
        };

        const commonEmailData = {
          text: `Jaký jsi měl tento týden v práci?`,
          subject: `Jaký jsi měl tento týden v práci?`,
        };

        users.forEach(async (user) => {
          if(user.send_feedback){
            const token = await FeedbackTokenModel.create({
              user_id: user.id,
              heatmap_week_id: heatmapWeek.id,
              token: crypto.randomBytes(16).toString('hex'),
            });

            EmailService.sendEmail({
              ...commonEmailData,
              toAddresses: [user.email],
              html: this.template({
                week: weekData,
                feedbackOptions: FeedbackSchedulerService.getFeedbackOptions(token.token),
              }),
            });
          }
        });

        Logger.debug('FeedbackScheduler: feedback email has been sent to every employee');
      },
    );
    Logger.debug('FeedbackScheduler: new feedback job has been scheduled');
  }

  cancel () {
    if (this.job) {
      this.job.cancel();
      Logger.debug('FeedbackScheduler: scheduled feedback job has been canceled');
    }
  }
}

module.exports = new FeedbackSchedulerService();
