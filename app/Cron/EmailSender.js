const AWS = require('aws-sdk');

AWS.config.update({region: 'eu-west-1'})

const params = {
  Destination: { /* required */
    CcAddresses: [
      'david.smejkal@techfides.cz'
    ],
    ToAddresses: [
      'david.smejkal@techfides.cz'
    ]
  },
  Message: {
    Body: {
      Html: {
        Charset: 'UTF-8',
        Data: 'HTML_FORMAT_BODY'
      },
      Text: {
        Charset: 'UTF-8',
        Data: 'TEXT_FORMAT_BODY'
      }
    },
    Subject: {
      Charset: 'UTF-8',
      Data: 'Test email'
    }
  },
  Source: 'david.smejkal@techfides.cz',
  ReplyToAddresses: [
    'david.smejkal@techfides.cz'
  ]
}

async function sendPromise () {
  try {
    let sendPromise = await new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
    console.log('done');
  } catch(err) {
    console.log(err.toString())
  }
}

sendPromise();
