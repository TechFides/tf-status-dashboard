export const state = () => ({
  error: [],
});

export const mutations = {
  setTest (state, errorObj) {
    state.error = [{e:errorObj.message}];
  },
};
