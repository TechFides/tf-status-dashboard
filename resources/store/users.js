import { sortAscByProperty } from '../utils/sorts';

export const state = () => ({
  items: [],
  roles: [],
});

export const mutations = {
  setUsers (state, users) {
    state.items = users.map(u => ({
      firstName: u.first_name,
      id: u.id,
      isActive: u.is_active,
      sendFeedback: u.send_feedback,
      lastName: u.last_name,
      username: u.username,
      email: u.email,
      absenceApprover: {
        id: u.user ? u.user.approver.id : null,
        fullName: u.user ? `${u.user.approver.first_name} ${u.user.approver.last_name}` : '',
      },
      roles: u.roles.map(r => r.slug),
    }));
  },
  setRoles (state, roles) {
    state.roles = roles;
  },
};

export const actions = {
  async getUsers ({ commit }) {
    const users = await this.$axios.$get('/api/users');

    commit('setUsers', users);
  },
  async createUser ({ dispatch, commit }, user) {
    try {
      await this.$axios.$post('/api/users', user);
      dispatch('getUsers');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async editUser ({ dispatch, commit }, user) {
    try {
      await this.$axios.$put(`/api/users/${user.id}`, user);
      dispatch('getUsers');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async deleteUser ({ dispatch, commit }, userId) {
    try {
      await this.$axios.$delete(`/api/users/${userId}`);
      dispatch('getUsers');
      commit('notification/clearNotification', null, { root: true });
    } catch (error) {
      commit('notification/setNotification', { color: 'error', message: `Uživatela se nepodařilo odstranit.` }, { root: true });
    }
  },
  async getRoles ({ commit }) {
    const roles = await this.$axios.$get('/api/roles');

    commit('setRoles', roles);
  },
};
