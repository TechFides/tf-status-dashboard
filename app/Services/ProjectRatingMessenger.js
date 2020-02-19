'use strict';
const { WebClient } = require('@slack/web-api');

const ProjectModel = use('App/Models/Project');
const Env = use('Env');

class ProjectRatingMessenger {
  async sendRatingMessage (projectId, ratingValue, ratingValueId) {

    const slackWebClient = new WebClient(Env.get('SLACK_TOKEN'));

    const project = (await ProjectModel
      .query()
      .where('id', '=', projectId)
      .fetch()).toJSON();

    let messageText = '';
    switch (ratingValueId) {
      case 0:
        messageText = `Ze standupu máte hodnotu ${ratingValue.value}. Jen tak dál.`;
        break;
      case 1:
        messageText = `Ze standupu máte hodnotu ${ratingValue.value}. Jen tak dál.`;
        break;
      case 2:
        messageText = `Ze standupu máte hodnotu ${ratingValue.value}. Jen tak dál.`;
        break;
      case 3:
        messageText = `Ze standupu máte hodnotu ${ratingValue.value}. Jen tak dál.`;
        break;
      case 4:
        messageText = `Ze standupu máte hodnotu ${ratingValue.value}. Jen tak dál.`;
        break;
      case 5:
        messageText = `Ze standupu máte hodnotu ${ratingValue.value}. Jen tak dál.`;
        break;
    }

    await slackWebClient.chat.postMessage({ channel: project[0].slack_channel, text: messageText });
  }
}

module.exports = new ProjectRatingMessenger();
