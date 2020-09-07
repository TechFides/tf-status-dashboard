export const state = () => ({
  error: {
    isVisible: false,
    message: '',
    field: '',
    validation: '',
  },
});

export const mutations = {
  setErrorState (state, errorObj) {
    state.error = {
      isVisible: true,
      message: errorObj.message ? errorObj.message : '',
    };
  },
  clearErrorState (state) {
    state.error = {
      isVisible: false,
      message: '',
    };
  },
};
