'use strict';

const FeedbackModel = use('App/Models/Feedback');
const HeatmapWeekModel = use('App/Models/HeatmapWeek');
const FeedbackEnumModel = use('App/Models/FeedbackEnum');

class FeedbackController {
  async createFeedback ({ request, response, auth }) {
    let user;
    try {
      user = await auth.getUser();
    } catch (e) {
      return response.status(401).send({ message: 'Invalid credentials' });
    }

    const { heatmapWeekId, feedbackEnumId } = request.only(['heatmapWeekId', 'feedbackEnumId']);

    if (!heatmapWeekId || !feedbackEnumId) {
      return response.status(400).send({ message: 'Bad request: heatmapId and feedbackEnumId are required' });
    }

    const heatmapWeek = await HeatmapWeekModel.query().where('id', heatmapWeekId).first();

    if (!heatmapWeek) {
      return response.status(404).send({ message: 'Not found: heatmap week with this ID does not exist' });
    }

    const feedbackEnum = await FeedbackEnumModel.query().where('id', feedbackEnumId).first();

    if (!feedbackEnum) {
      return response.status(404).send({ message: 'Not found: feedback enum with this ID does not exist' });
    }

    const exists = await FeedbackModel
      .query()
      .where('heatmap_week_id', heatmapWeekId)
      .where('user_id', user.id)
      .first();

    if (exists) {
      return response.status(409).send({ message: 'Conflict: feedback already exists' });
    }

    const feedback = new FeedbackModel();
    feedback.fill({ heatmap_week_id: heatmapWeekId, feedback_enum_id: feedbackEnumId });
    feedback.user().associate(user);

    return response.send();
  }
}

module.exports = FeedbackController;
