'use strict';

const sgMail = require('@sendgrid/mail');
const Env = use('Env');
const Logger = use('Logger');

class EmailService {
  constructor() {
    sgMail.setApiKey(Env.get('SENDGRID_API_KEY'));
  }

  async sendEmail({ toAddresses, html, text, subject }) {
    const msg = {
      to: toAddresses,
      from: Env.get('EMAIL_ADDRESS'),
      subject,
      text,
      html,
      category: 'TF_FEEDBACK',
    };

    try {
      await sgMail.send(msg);
    } catch (err) {
      Logger.error(err.toString());
    }
  }
}

module.exports = new EmailService();
