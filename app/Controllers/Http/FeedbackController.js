'use strict';

const FeedbackModel = use('App/Models/Feedback');
const HeatmapWeekModel = use('App/Models/HeatmapWeek');

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

    const exists = await FeedbackModel
      .query()
      .where('heatmap_week_id', heatmapWeekId)
      .where('user_id', user.id)
      .first();

    if (exists) {
      return response.status(409).send({ message: 'Feedback already exists' });
    }

    const feedback = new FeedbackModel();
    feedback.fill({ heatmap_week_id: heatmapWeekId, feedback_enum_id: feedbackEnumId });

    feedback.user().associate(user);

    return response.send();
  }
}

module.exports = FeedbackController;
