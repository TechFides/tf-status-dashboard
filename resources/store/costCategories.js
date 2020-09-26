export const state = () => ({
  items: [],
});

export const mutations = {
  setCostCategories(state, costCategories) {
    state.items = costCategories;
  },
};

export const actions = {
  async getCostCategories({ commit }) {
    const positionId = this.$auth.user.position_id;
    const costCategories = await this.$axios.$get('/api/cost-categories', { params: { positionId } });

    commit('setCostCategories', costCategories);
  },
};
