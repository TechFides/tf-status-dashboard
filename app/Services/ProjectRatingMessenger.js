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
            color: '#c62828',
            text: `Tak tohle se hodně nepovedlo :disappointed: chtělo by to zase pořádně máknout! \n Ze sitdownu máte \*${ratingValue.value}XP\*.`,
            image_url: `${process.env.VUE_APP_URL}/images/standup_rating_fail.gif`,
          },
        ];
        break;
      case 6:
        attachments = [
          {
            color: '#3f51b5',
            text: `Nazvěme to průměrně odvedená práce... ale tu my přece neděláme \*${ratingValue.value}XP\* :sunglasses:.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_standard.png`,
          },
        ];
        break;
      case 7:
        attachments = [
          {
            color: '#4caf50',
            text: `Prostor na zlepšení by tu byl, ale v zásadě dobře odvedený kus práce :thumbsup:. \n Ze sitdownu máte hodnotu \*${ratingValue.value}XP\*.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_good.png`,
          },
        ];
        break;
      case 5:
        attachments = [
          {
            color: '#4caf50',
            text: `Fantastická práce :muscle:. Ze sitdownu máte \*${ratingValue.value}XP\*. Jen tak dál!`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_amazing.png`,
          },
        ];
        break;
    }

    await slackWebClient.chat.postMessage({ channel: project[0].slack_channel, attachments: attachments });
  }
}

module.exports = new ProjectRatingMessenger();
