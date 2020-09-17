export const state = () => ({
  items: [],
});

export const mutations = {
  setPermissions (state, permissions) {
    state.items = permissions.map(p => ({
      id: p.id,
      name: p.name,
      value: p.value,
    }));
  },
};

export const actions = {
  async getPermissions ({ commit }) {
    const permissions = await this.$axios.$get('/api/permissions');

    commit('setPermissions', permissions);
  },
};
