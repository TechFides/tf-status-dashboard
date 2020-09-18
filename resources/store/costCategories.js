export const state = () => ({
  items: [],
});

const formatCostCategories = (costCategories) => {
  let flattenArray = [];
  for (const category of costCategories) {
    if (category.subCategories.length) {
      for (const subCategorie of category.subCategories) {
        flattenArray.push({
          workCategory: subCategorie.workCategory,
          name: `${category.name} -> ${subCategorie.name}`,
          id: subCategorie.id,
        });
      }
    } else {
      flattenArray.push({
        workCategory: category.workCategory,
        name: category.name,
        id: category.id,
      });
    }
  }

  return flattenArray.filter(f => f.workCategory);
};

export const mutations = {
  setCostCategories (state, costCategories) {
    state.items = costCategories;
  },
};

export const actions = {
  async getCostCategories ({ commit }) {
    const positionId = this.$auth.user.position_id;
    const costCategories = await this.$axios.$get('/api/cost-categories', { params: { positionId } });

    commit('setCostCategories', costCategories);
  },
  async costCategoriesSynchronizations ({ dispatch, commit }) {
    const positionId = this.$auth.user.position_id;
    try {
      const costCategories = await this.$axios({ url: '/api/cost-categories/tree', baseURL: process.env.NUXT_ENV_TF_ERP_API_URL, headers: {
          apitoken: process.env.NUXT_ENV_TF_ERP_API_TOKEN,
          Authorization: '',
        },
      });
      const payload = {
        costCategoriesData: formatCostCategories(costCategories.data.data),
        positionId,
      };

      await this.$axios.post('/api/cost-categories/synchronization', payload);
      commit('notification/clearNotification', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('notification/setNotification', error.response.data[0], { root: true });
      }
    }
  },
};
