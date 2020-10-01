export const state = () => ({
  my: [],
  all: [],
});

export const mutations = {
  setCostCategories(state, costCategories) {
    state.items = costCategories;
  },
};

export const actions = {
  async getMyCostCategories({ commit }) {
    const positionId = this.$auth.user.position_id;
    const costCategories = await this.$axios.$get('/api/cost-categories', { params: { positionId } });

    commit('setCostCategories', costCategories);
  },
  async getAllCostCategories({ commit }) {
    const costCategories = await this.$axios.$get('/api/cost-categories');

    commit('setCostCategories', costCategories);
  },
};
