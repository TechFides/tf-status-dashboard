import { sortAscByProperty } from '../utils/sorts';

export const state = () => ({
  items: [],
  ratings: [],
});

export const mutations = {
  setNotes(state, notes) {
    state.items = notes
      .map(n => ({
        id: n.id,
        projectId: n.project.id,
        projectCode: n.project.code,
        deadlineDate: n.deadline,
        created: n.created_at,
        text: n.note,
      }))
      .sort(sortAscByProperty.bind(this, 'projectCode'));
  },
};

export const actions = {
  async getNotes({ commit }) {
    const notes = await this.$axios.$get('/api/notes');
    commit('setNotes', notes);
  },
  async createNote({ dispatch, commit }, note) {
    try {
      await this.$axios.$post('/api/notes', note);
      dispatch('getNotes');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async editNote({ dispatch, commit }, note) {
    try {
      await this.$axios.$put(`/api/notes/${note.id}`, note);
      dispatch('getNotes');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0]);
      }
    }
  },
  async markNoteCompleted({ dispatch, commit }, noteId) {
    try {
      await this.$axios.$post(`/api/notes/${noteId}/completed`);
      dispatch('getNotes');
      commit('notification/clearNotification', null, { root: true });
    } catch (error) {
      commit(
        'notification/setNotification',
        { color: 'error', message: `Označení poznámky za dokončenou se nezdařilo.` },
        { root: true },
      );
    }
  },
};
