export const state = () => ({
  my: [],
  all: [],
});

export const mutations = {
  setMyCostCategories(state, costCategories) {
    state.my = costCategories;
  },
  setAllCostCategories(state, costCategories) {
    state.all = costCategories;
  },
};

export const actions = {
  async getMyCostCategories({ commit }) {
    const positionId = this.$auth.user.position_id;
    const costCategories = await this.$axios.$get('/api/cost-categories', { params: { positionId } });

    commit('setMyCostCategories', costCategories);
  },
  async getAllCostCategories({ commit }) {
    const costCategories = await this.$axios.$get('/api/cost-categories');

    commit('setAllCostCategories', costCategories);
  },
};
