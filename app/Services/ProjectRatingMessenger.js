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

    let attachments = '';
    switch (ratingValueId) {
      case 1:
        attachments = [
          {
            fallback: 'Plain-text summary of the attachment.',
            color: '#c62828',
            text: `Tak tohle se hodně nepovedlo, chtělo by to zase pořádně máknout. Ze standupu máte hodnotu \*${ratingValue.value}\*.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_fail.png`,
          }
        ];
        break;
      case 2:
        attachments = [
          {
            fallback: 'Plain-text summary of the attachment.',
            color: '#c62828',
            text: `Tohle už je hodně na hraně, chtělo by to zlepšit \*${ratingValue.value}\*.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_bad.png`,
          }
        ];
        break;
      case 3:
        attachments = [
          {
            fallback: 'Plain-text summary of the attachment.',
            color: '#3f51b5',
            text: `Nazvěme to průměrně odvedená práce... ale tu my přece neděláme \*${ratingValue.value}\*.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_standard.png`,
          }
        ];
        break;
      case 4:
        attachments = [
          {
            fallback: 'Plain-text summary of the attachment.',
            color: '#4caf50',
            text: `Prostor na zlepšení by tu byl, ale v zásadě dobře odvedený kus práce. \n Ze standupu máte hodnotu \*${ratingValue.value}\*.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_good.png`,
          }
        ];
        break;
      case 5:
        attachments = [
          {
            fallback: 'Plain-text summary of the attachment.',
            color: '#4caf50',
            text: `Fantastická práce. :hero: Ze standupu máte \*${ratingValue.value}\*. Jen tak dál.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_amazing.png`,
          }
        ];
        break;
    }

    await slackWebClient.chat.postMessage({ channel: project[0].slack_channel, attachments: attachments });
  }
}

module.exports = new ProjectRatingMessenger();
