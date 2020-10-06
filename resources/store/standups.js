import { sortAscByProperty } from '../utils/sorts';
import { getDateParams, getActiveParams } from '../utils/getParams';

const getStandupIndex = (state, standupId) => {
  for (const [index, rating] of state.ratings.entries()) {
    if (rating.id === standupId) {
      return index;
    }
  }

  throw new Error('Invalid standup id');
};

const filterProjectsByRatings = (projects, ratings, date) => {
  const allowedProjectIds = {};
  const currentDate = new Date();

  for (const { standupProjectRating } of ratings) {
    for (const { project_id: projectId } of standupProjectRating) {
      allowedProjectIds[projectId] = true;
    }
  }

  return date > currentDate ? projects : projects.filter(p => allowedProjectIds[p.id]);
};

export const state = () => ({
  ratings: [],
});

export const mutations = {
  updateRating(state, { projectId, ratingValueId, standupId }) {
    const standupIndex = getStandupIndex(state, standupId);
    const newStandupRatings = [...state.ratings];
    const newRatings = { ...newStandupRatings[standupIndex].standupProjectRating };
    newRatings[projectId] = ratingValueId;
    newStandupRatings[standupIndex].standupProjectRating = newRatings;

    state.ratings = newStandupRatings;
  },
  setProjectRatings(state, standupRatings) {
    const newStandupRatings = standupRatings.sort(sortAscByProperty.bind(this, 'date'));
    for (const [index, { standupProjectRating }] of newStandupRatings.entries()) {
      const newRatings = {};
      for (const { project_id: projectId, standup_project_rating_enum_id: standupId } of standupProjectRating) {
        newRatings[projectId] = standupId;
      }

      newStandupRatings[index].standupProjectRating = newRatings;
    }

    state.ratings = newStandupRatings;
  },
};

export const actions = {
  async editRating({ commit }, ratingData) {
    await this.$axios.$post('/api/projectRatings', ratingData);
    commit('updateRating', ratingData);
  },
  async createStandup({ dispatch, commit }, standup) {
    try {
      await this.$axios.$post('/api/standups', standup);
      dispatch('getProjectRating', standup.selectedDate);
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async deleteStandup({ dispatch, commit }, standup) {
    try {
      await this.$axios.$delete(`/api/standups/${standup.id}`);
      dispatch('getProjectRating', standup.selectedDate);
    } catch (error) {
      commit(
        'notification/setNotification',
        { color: 'error', message: 'Smazat standup se nezdařilo.' },
        { root: true },
      );
    }
  },
  async editStandup({ dispatch, commit }, standup) {
    try {
      await this.$axios.$put(`/api/standups/${standup.id}`, standup);
      dispatch('getProjectRating', standup.selectedDate);
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async getProjectRating({ commit }, date) {
    try {
      const res = await this.$axios.$get('/api/projectRatings', getDateParams(date));
      commit('setProjectRatings', res);
    } catch (error) {
      commit(
        'notification/setNotification',
        { color: 'error', message: 'Získat hodnocení projektu se nezdařilo.' },
        { root: true },
      );
    }
  },
  async getProjectsForMonth({ commit }, date) {
    const dateParams = getDateParams(date);
    const [projectData, ratingsData] = await Promise.all([
      this.$axios.$get('/api/projects'),
      this.$axios.$get('/api/projectRatings', dateParams),
    ]);

    const projects = filterProjectsByRatings(projectData, ratingsData, date);
    commit('projects/setProjects', projects, { root: true });
    commit('setProjectRatings', ratingsData);
  },
  async getStandupData({ commit, rootState }) {
    const meetingTimes = rootState.meetingTimes.items;
    const [projects, ratingsData] = await Promise.all([
      this.$axios.$get('/api/projects', getActiveParams()),
      this.$axios.$get('/api/projectRatings', getDateParams()),
    ]);
    commit('projects/setProjects', { projects, meetingTimes }, { root: true });
    commit('setProjectRatings', ratingsData);
  },
};
