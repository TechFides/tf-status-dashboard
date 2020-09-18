export const state = () => ({
  items: [],
});

export const mutations = {
  setPositions (state, positions) {
    state.items = positions.map(p => ({
      id: p.id,
      name: p.name,
      permissions: p.permissions,
      costCategories: p.costCategories,
      sendFeeback: p.send_feedback,
      isPlayer: p.is_player,
    }));
  },
};

export const actions = {
  async positionSynchronizations ({ dispatch, commit }) {
    try {
      const positions = await this.$axios({ url: '/api/employee-positions', baseURL: process.env.NUXT_ENV_TF_ERP_API_URL, headers: {
          apitoken: process.env.NUXT_ENV_TF_ERP_API_TOKEN,
          Authorization: '',
        },
      });
      await this.$axios.post('/api/positions/synchronization', positions.data.data);
      dispatch('getPositions');
      commit('notification/clearNotification', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('notification/setNotification', error.response.data[0], { root: true });
      }
    }
  },
  async getPositions ({ commit }) {
    const positions = await this.$axios.$get('/api/positions');

    commit('setPositions', positions);
  },
  async setPermissions ({ dispatch, commit }, payload) {
    try {
      await this.$axios.$post(`/api/positions/set-permissions/${payload.positionId}`, payload.permissionIds);
      dispatch('getPositions');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async setFeedback ({ dispatch, commit }, position) {
    try {
      await this.$axios.$post(`/api/positions/set-feedback/${position.id}`, { sendFeedback: position.sendFeedback });
      dispatch('getPositions');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async setPlayer ({ dispatch, commit }, position) {
    try {
      await this.$axios.$post(`/api/positions/set-player/${position.id}`, { isPlayer: position.isPlayer });
      dispatch('getPositions');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
};
