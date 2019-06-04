'use strict';

const Handlebars = require('handlebars');
const Schedule = require('node-schedule');

const FEEDBACK_EMAIL_HTML = `
<html>
  <head>
    <title>Týdenní zpětná vazba #{{ week.number }}</title>
  </head>
  <body>
    <h1>Týdenní zpětná vazba #{{ week.number }}: {{ week.from }} - {{ week.to }}</h1>
    <section>
      <h2>Jaky byl tvuj tyden, kamaráde?</h2>
      <ul>
        {{#each feedbackOptions}}
          <li class="options-list__item">
            <a href="{{feedbackUrl}}">{{text}}</a>
          </li>
        {{/each}}
      </ul>
    </section>
  </body>
</html>
`;

class FeedbackSchedulerService {
  static getFeedbackOptions (heatmapWeekId) {
    const feedbackOptions = [
      { text: 'AMAZING', id: 1 },
      { text: 'GOOD', id: 2 },
      { text: 'BAD', id: 3 },
      { text: 'HORRIBLE', id: 4 },
    ];
    return feedbackOptions.map(option => ({
      ...option,
      feedbackUrl: `http://localhost:3333/submit-feedback?heatmapWeekId=${heatmapWeekId}&feedbackEnumId=${option.id}`,
    }));
  }

  static getReccurrenceRule () {
    return '*/2 * * * *';
    // TODO: implement custom schedule using app settings from DB
    // return new Schedule.RecurrenceRule(null, null, null, 1, 9, 30, null);
  }

  constructor () {
    this.job = null;
    this.logger = use('Logger');
    this.emailService = use('App/Services/Email');
    this.template = Handlebars.compile(FEEDBACK_EMAIL_HTML);
  }

  schedule () {
    this.cancel();

    this.job = Schedule.scheduleJob(
      FeedbackSchedulerService.getReccurrenceRule(),
      () => {
        // TODO: create new heatmap for the last week

        const data = {
          feedbackOptions: FeedbackSchedulerService.getFeedbackOptions(1),
          week: { number: 1, from: '2019-06-03', to: '2019-06-09' },
        };

        this.emailService.sendEmail({
          toAddresses: ['vladislav.bulyukhin@techfides.cz'],
          html: this.template(data),
          text: `Týdenní zpětná vazba #${data.week.number}. Jaky byl tvuj tyden, kamaráde?`,
          subject: `Týdenní zpětná vazba #${data.week.number}`,
        });

        this.logger.info('feedback email has been sent to every employee');
      },
    );

    this.logger.info('new feedback job has been scheduled');
  }

  cancel () {
    if (this.job) {
      this.job.cancel();
      this.logger.info('scheduled feedback job has been canceled');
    }
  }
}

module.exports = new FeedbackSchedulerService();
