export default function ({ $axios, app, redirect }) {
  $axios.onError(error => {
    app.$notifier.showMessage({ message: error.message, color: 'red' });
  });
  $axios.onResponse(response => {
    app.$notifier.showMessage({ message: 'here', color: 'green' });
    return response;
  });
}
