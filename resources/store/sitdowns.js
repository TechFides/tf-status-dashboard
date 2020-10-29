import { sortAscByProperty } from '../utils/sorts';
import { getDateParams, getActiveParams } from '../utils/getParams';

const getSitdownIndex = (state, sitdownId) => {
  for (const [index, rating] of state.ratings.entries()) {
    if (rating.id === sitdownId) {
      return index;
    }
  }

  throw new Error('Invalid sitdown id');
};

const filterProjectsByRatings = (projects, ratings, date) => {
  const allowedProjectIds = {};
  const currentDate = new Date();

  for (const { sitdownProjectRating } of ratings) {
    for (const { project_id: projectId } of sitdownProjectRating) {
      allowedProjectIds[projectId] = true;
    }
  }

  return date > currentDate ? projects : projects.filter(p => allowedProjectIds[p.id]);
};

export const state = () => ({
  ratings: [],
});

export const mutations = {
  updateRating(state, { projectId, ratingValueId, sitdownId }) {
    const sitdownIndex = getSitdownIndex(state, sitdownId);
    const newSitdownRatings = [...state.ratings];
    const newRatings = { ...newSitdownRatings[sitdownIndex].sitdownProjectRating };
    newRatings[projectId] = ratingValueId;
    newSitdownRatings[sitdownIndex].sitdownProjectRating = newRatings;

    state.ratings = newSitdownRatings;
  },
  setProjectRatings(state, sitdownRatings) {
    const newSitdownRatings = sitdownRatings.sort(sortAscByProperty.bind(this, 'date'));
    for (const [index, { sitdownProjectRating }] of newSitdownRatings.entries()) {
      const newRatings = {};
      for (const { project_id: projectId, sitdown_project_rating_enum_id: sitdownId } of sitdownProjectRating) {
        newRatings[projectId] = sitdownId;
      }

      newSitdownRatings[index].sitdownProjectRating = newRatings;
    }

    state.ratings = newSitdownRatings;
  },
};

export const actions = {
  async editRating({ commit }, ratingData) {
    await this.$axios.$post('/api/projectRatings', ratingData);
    commit('updateRating', ratingData);
  },
  async createSitdown({ dispatch, commit }, sitdown) {
    try {
      await this.$axios.$post('/api/sitdowns', sitdown);
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async deleteSitdown({ dispatch, commit }, sitdown) {
    try {
      await this.$axios.$delete(`/api/sitdowns/${sitdown.id}`);
      dispatch('getProjectRating', sitdown.selectedDate);
    } catch (error) {
      commit(
        'notification/setNotification',
        { color: 'error', message: 'Smazat sitdown se nezdařilo.' },
        { root: true },
      );
    }
  },
  async editSitdown({ dispatch, commit }, sitdown) {
    try {
      await this.$axios.$put(`/api/sitdowns/${sitdown.id}`, sitdown);
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
  async getSitdownData({ commit, rootState }) {
    const meetingTimes = rootState.meetingTimes.items;
    const [projects, ratingsData] = await Promise.all([
      this.$axios.$get('/api/projects', getActiveParams()),
      this.$axios.$get('/api/projectRatings', getDateParams()),
    ]);
    commit('projects/setProjects', { projects, meetingTimes }, { root: true });
    commit('setProjectRatings', ratingsData);
  },
};
