const AWS = require('aws-sdk');

AWS.config.update({region: 'eu-west-1'})

let params = {};
let templateData = {};
templateData.userName = 'David';
let destination = {
  'ToAddresses': ['david.smejkal@techfides.cz']
};

params.TemplateData = JSON.stringify(templateData);
params.Source = 'david.smejkal@techfides.cz';
params.Destination = destination;
params.Template = 'feedbackTemplate';

async function sendPromise () {
  try {
    let promise = await new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();
    console.log('done');
  } catch(err) {
    console.log(err.toString())
  }
}

sendPromise();
