export const state = () => ({
  items: [],
});

export const mutations = {
  setCostCategories (state, costCategories) {
    let flat = [];
    for (let i = 0; i < costCategories.data.length; i++) {
      flat = flat.concat(costCategories.data[i].subCategories);
    }
    const flattenArray = flat.concat(costCategories.data).map(f => ({
      hasSubCategory: f.subCategories,
      workCategory: f.workCategory,
      name: f.name,
      id: f.id,
    }));

    state.items = flattenArray.filter(f => !f.hasSubCategory.length && f.workCategory);
  },
};

export const actions = {
  async getCostCategories ({ commit }) {
    const costCategories = await this.$axios({ url: '/api/cost-categories/tree', baseURL: process.env.NUXT_ENV_TF_ERP_API_URL, headers: {
        apitoken: process.env.NUXT_ENV_TF_ERP_API_TOKEN,
        Authorization: '',
      },
    });
    commit('setCostCategories', costCategories.data);
  },
};
