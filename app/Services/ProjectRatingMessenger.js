'use strict';
const { WebClient } = require('@slack/web-api');
const { RATING_ENUM } = require('../../constants');

const ProjectModel = use('App/Models/Project');
const Env = use('Env');

class ProjectRatingMessenger {
  async sendRatingMessage (projectId, ratingValue, ratingValueId) {

    const slackWebClient = new WebClient(Env.get('SLACK_TOKEN'));

    const project = (await ProjectModel
      .query()
      .with('slackChannel')
      .where('id', '=', projectId)
      .fetch()).toJSON();

    let attachments = '';
    switch (ratingValueId) {
      case RATING_ENUM.FAIL:
        attachments = [
          {
            color: '#c62828',
            text: `Tak tohle se hodně nepovedlo :disappointed: chtělo by to zase pořádně máknout! \n Ze sitdownu máte \*${ratingValue.value}XP\*.`,
            image_url: `${process.env.VUE_APP_URL}/images/standup_rating_fail.gif`,
          },
        ];
        break;
      case RATING_ENUM.STANDARD:
        attachments = [
          {
            color: '#3f51b5',
            text: `Nazvěme to průměrně odvedená práce... ale tu my přece neděláme \*${ratingValue.value}XP\* :sunglasses:.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_standard.png`,
          },
        ];
        break;
      case RATING_ENUM.GOOD:
        attachments = [
          {
            color: '#4caf50',
            text: `Prostor na zlepšení by tu byl, ale v zásadě dobře odvedený kus práce :thumbsup:. \n Ze sitdownu máte hodnotu \*${ratingValue.value}XP\*.`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_good.png`,
          },
        ];
        break;
      case RATING_ENUM.AMAZING:
        attachments = [
          {
            color: '#4caf50',
            text: `Fantastická práce :muscle:. Ze sitdownu máte \*${ratingValue.value}XP\*. Jen tak dál!`,
            thumb_url: `${process.env.VUE_APP_URL}/images/standup_rating_amazing.png`,
          },
        ];
        break;
    }

    try {
      await slackWebClient.chat.postMessage({ channel: project[0].slack_channel_id, attachments: attachments });
    } catch (error) {
      const attachments = [
        {
          color: '#c62828',
          text: `Jeejda, něco se porouchalo :exclamation: \n Chyba: \*${error.data.error}\*.`,
        },
      ];

      await slackWebClient.chat.postMessage({ channel: 'slackbot-errors', attachments: attachments });
      console.error(error);
    }
  }
}

module.exports = new ProjectRatingMessenger();
