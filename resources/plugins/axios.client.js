import { get, isString } from 'lodash';

export default function ({ $axios, app, redirect }) {
  $axios.onError(error => {
    app.$notifier.showMessage({ message: get(error, 'message') || 'Error', color: 'red' });
  });
  $axios.onResponse(response => {
    const requestUrl = get(response, 'config.url');
    if (isString(requestUrl) && requestUrl.search('auth') === -1) {
      const requestMethod = get(response, 'config.method');
      switch (requestMethod) {
        case 'post':
        case 'put':
        case 'patch':
          app.$notifier.showMessage({ message: 'Saved', color: 'green' });
          break;
        case 'delete':
          app.$notifier.showMessage({ message: 'Deleted', color: 'green' });
          break;
      }
    }
    return response;
  });
}
