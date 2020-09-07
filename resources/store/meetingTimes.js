import { WEEK_DAYS, WEEK_DAYS_SHORTHAND } from '../constants';

export const state = () => ({
  items: [],
});

export const mutations = {
  setMeetingTimes (state, meetingTimes) {
    state.items = meetingTimes.map(
      meetingTime => {
        const timeWithoutSeconds = meetingTime.time.substring(0, 5);

        return {
          id: meetingTime.id,
          name: meetingTime.name,
          projects: meetingTime.projects.map(({ code }) => code).join(', '),
          time: timeWithoutSeconds,
          weekDayId: Number(meetingTime.week_day),
          weekDay: WEEK_DAYS[meetingTime.week_day],
          dayAndTime: `${WEEK_DAYS_SHORTHAND[meetingTime.week_day]} ${timeWithoutSeconds}`,
        };
      });
  },
};

export const actions = {
  async getMeetingTimes ({ commit }) {
    const meetingTimes = await this.$axios.$get('/api/meeting-times');
    commit('setMeetingTimes', meetingTimes);
  },
  async createMeetingTime ({ dispatch, commit }, meetingTime) {
    try {
      await this.$axios.$post('/api/meeting-times', meetingTime);
      commit('errors/clearErrorState', null, { root: true });
      dispatch('getMeetingTimes');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async editMeetingTime ({ dispatch, commit }, meetingTime) {
    try {
      await this.$axios.$put(`/api/meeting-times/${meetingTime.id}`, meetingTime);
      commit('errors/clearErrorState', null, { root: true });
      dispatch('getMeetingTimes');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async deleteMeetingTime ({ dispatch, commit }, meetingTimeId) {
    try {
      await this.$axios.$delete(`/api/meeting-times/${meetingTimeId}`);
      commit('notification/clearNotification', null, { root: true });
      dispatch('getMeetingTimes');
    } catch (error) {
      commit('notification/setNotification', { color: 'error', message: 'Smazat čas konání se nezdařilo.' }, { root: true });
    }
  },
};
