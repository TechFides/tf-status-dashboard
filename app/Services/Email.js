'use strict';

const AWS = require('aws-sdk');
const Env = use('Env');

class EmailService {
  constructor () {
    this.logger = use('Logger');
    AWS.config.update({ region: 'us-west-2' });
  }

  async sendEmail ({ toAddresses, html, text, subject }) {
    const params = {
      Source: Env.get('EMAIL_ADDRESS'),
      Destination: { ToAddresses: toAddresses },
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: {
          Text: { Charset: 'UTF-8', Data: text },
          Html: { Charset: 'UTF-8', Data: html },
        },
      },
    };

    try {
      await new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
    } catch (err) {
      this.logger.error(err.toString());
    }
  }
}

module.exports = new EmailService();
