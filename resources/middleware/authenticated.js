import { pathRedirect } from '../utils/pathRedirect';

export default function ({ app, store, route, redirect }) {
  // pathRedirect(app, route, redirect);
  if (app.isAdministration()) {
    return;
  } else if (app.$auth.user.position.permissions.some(permission => route.name === permission.value)) {
    return;
  }

  return redirect('/');
};
