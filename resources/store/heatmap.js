import { sortAscByProperty } from '../utils/sorts';
import { getActiveParams, getDateParams } from '../utils/getParams';

export const state = () => ({
  items: [],
  usersFeedbacks: [],
});

export const mutations = {
  setUsersFeedbacks (state, userFeedbacks) {
    const newUserFeedbacks = userFeedbacks.sort(sortAscByProperty.bind(this, 'first_name'));
    for (const [index, { feedback }] of newUserFeedbacks.entries()) {
      const newFeedback = {};
      for (const { heatmap_week_id: heatMapId, feedback_enum_id: feedbackId } of feedback) {
        newFeedback[heatMapId] = feedbackId;
      }

      newUserFeedbacks[index].feedback = newFeedback;
    }

    state.usersFeedbacks = newUserFeedbacks;
  },
  setHeatmapWeeks (state, heatmap) {
    state.items = heatmap.sort(sortAscByProperty.bind(this, 'date'));
  },
};

export const actions = {
  async getFeedbackData ({ commit }, date) {
    const [heatmap, feedbacks] = await Promise.all([
      this.$axios.$get(
        '/api/heatmap',
        getDateParams(date),
      ),
      this.$axios.$get(
        '/api/heatmap/feedbacks',
        getActiveParams(),
      ),
    ]);

    commit('setHeatmapWeeks', heatmap);
    commit('setUsersFeedbacks', feedbacks);
  },
};
