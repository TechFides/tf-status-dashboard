'use strict';

const AWS = require('aws-sdk');

class EmailService {
  constructor () {
    this.logger = use('Logger');
    AWS.config.update({ region: 'us-west-2' });
  }

  async sendEmail ({ toAddresses, html, text, subject }) {
    const params = {
      Source: 'vladislav.bulyukhin@techfides.cz',
      Destination: { ToAddresses: toAddresses },
      Message: {
        Body: {
          Html: { Charset: 'UTF-8', Data: html },
          Text: { Charset: 'UTF-8', Data: text },
        },
        Subject: { Charset: 'UTF-8', Data: subject },
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
