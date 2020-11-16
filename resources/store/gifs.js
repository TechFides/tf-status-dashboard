export const state = () => ({
  items: [],
});

export const mutations = {
  setGifs(state, gifData) {
    state.items = gifData.map(g => ({
      url: g.embed_url,
    }));
  },
};

export const actions = {
  async getRandomGif({ dispatch, commit }, params) {
    const gifs = await this.$axios.$get(`${process.env.NUXT_ENV_GIPHY_API_URL}/v1/gifs/search`, { params });
    commit('setGifs', gifs.data);
  },
};
