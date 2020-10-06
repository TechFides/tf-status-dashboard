const NOTIFICATION_TIMEOUT = 4000;

export const state = () => ({
  items: {
    isVisible: false,
    message: '',
    color: '',
    notificationTimeout: null,
  },
});

export const mutations = {
  setNotification(state, notification) {
    state.items = {
      isVisible: true,
      message: notification.message ? notification.message : '',
      color: notification.color ? notification.color : '',
    };
    if (state.items.notificationTimeout) {
      this.commit('notification/clearNotification');
    }

    state.items.notificationTimeout = setTimeout(() => {
      this.commit('notification/clearNotification');
    }, NOTIFICATION_TIMEOUT);
  },
  clearNotification(state) {
    state.items = {
      isVisible: false,
      message: '',
      color: '',
    };

    if (state.items.notificationTimeout) {
      clearTimeout(state.items.notificationTimeout);
      state.items.notificationTimeout = null;
    }
  },
};
