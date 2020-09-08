export const state = () => ({
  items: [],
});

export const mutations = {
  setCostCategories (state, costCategories) {
    let flattenArray = [];
    for (const categorie of costCategories.data) {
      if (categorie.subCategories.length) {
        for (const subCategorie of categorie.subCategories) {
          flattenArray.push({
            workCategory: subCategorie.workCategory,
            name: `${categorie.name} -> ${subCategorie.name}`,
            id: subCategorie.id,
          });
        }
      } else {
        flattenArray.push({
          workCategory: categorie.workCategory,
          name: categorie.name,
          id: categorie.id,
        });
      }
    }

    state.items = flattenArray.filter(f => f.workCategory);
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
