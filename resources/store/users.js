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
      isAdmin: u.is_admin,
      sendFeedback: u.send_feedback,
      lastName: u.last_name,
      email: u.email,
      absenceApprover: {
        id: u.user ? u.user.approver.id : null,
        fullName: u.user ? `${u.user.approver.first_name} ${u.user.approver.last_name}` : '',
      },
      position: u.position ? u.position.name: '',
    }));
  },
  setRoles (state, roles) {
    state.roles = roles;
  },
};

export const actions = {
  async usersSynchronizations ({ dispatch, commit }) {
    try {
      const employees = await this.$axios({ url: '/api/employees', baseURL: process.env.NUXT_ENV_TF_ERP_API_URL, headers: {
          apitoken: process.env.NUXT_ENV_TF_ERP_API_TOKEN,
          Authorization: '',
        },
      });
      await this.$axios.post('/api/users/synchronization', employees.data.data);
      dispatch('getUsers');
      commit('notification/clearNotification', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('notification/setNotification', error.response.data[0], { root: true });
      }
    }
  },
  async getUsers ({ commit }) {
    const users = await this.$axios.$get('/api/users');

    commit('setUsers', users);
  },
  async setAdmin ({ dispatch, commit }, user) {
    try {
      await this.$axios.$post(`/api/users/set-admin/${user.id}`, { isAdmin: user.isAdmin });
      dispatch('getUsers');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async setApprover ({ dispatch, commit }, user) {
    try {
      await this.$axios.$post(`/api/users/set-approver/${user.userId}`, { approverId: user.approverId });
      dispatch('getUsers');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async getRoles ({ commit }) {
    const roles = await this.$axios.$get('/api/roles');

    commit('setRoles', roles);
  },
};
