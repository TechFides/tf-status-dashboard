export default ({ app, store }, inject) => {
  inject('notifier', {
    showMessage(payload) {
      store.commit('notification/setNotification', payload);
    },
  });
};
