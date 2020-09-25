'use strict';

const FeedbackModel = use('App/Models/Feedback');
const FeedbackEnumModel = use('App/Models/FeedbackEnum');
const FeedbackTokenModel = use('App/Models/FeedbackToken');

class FeedbackController {
  async createFeedback({ request, response }) {
    const { token, feedbackEnumId } = request.only(['token', 'feedbackEnumId']);

    if (!token || !feedbackEnumId) {
      return response.status(400).send({ message: 'Bad request: token and feedbackEnumId are required' });
    }

    const feedbackToken = await FeedbackTokenModel.query()
      .where('token', token)
      .with('user')
      .with('heatmapWeek')
      .first();

    if (!feedbackToken) {
      return response.status(404).send({ message: 'Not found: token is invalid' });
    }

    if (feedbackToken.expired) {
      return response.status(403).send({ message: 'Forbidden: token has expired' });
    }

    const feedbackEnum = await FeedbackEnumModel.query().where('id', feedbackEnumId).first();

    if (!feedbackEnum) {
      return response.status(404).send({ message: 'Not found: feedback enum with this ID does not exist' });
    }

    const user = await feedbackToken.user().fetch();
    const heatmapWeek = await feedbackToken.heatmapWeek().fetch();

    const feedback = await FeedbackModel.findOrNew(function () {
      this.where('heatmap_week_id', heatmapWeek.id);
      this.where('user_id', user.id);
    });

    feedback.merge({
      heatmap_week_id: heatmapWeek.id,
      feedback_enum_id: feedbackEnumId,
      user_id: user.id,
    });

    await feedback.save();

    return response.send();
  }
}

module.exports = FeedbackController;
