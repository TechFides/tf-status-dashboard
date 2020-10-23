export default function ({ app, store, route, redirect }) {
  if (route.name === 'index') {
    return;
  }

  if (
    route.name === 'submit-google-auth' ||
    route.name === 'submit-office-absence' ||
    route.name === 'submit-office-absence' ||
    route.name === 'submit-feedback'
  ) {
    return;
  }

  if (app.isAdministration()) {
    return;
  } else if (
    app.$auth.user &&
    app.$auth.user.position &&
    app.$auth.user.position.permissions.some(permission => route.name === permission.value)
  ) {
    return;
  }

  return redirect('/');
}
