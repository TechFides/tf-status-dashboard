export default function({ app, store, route, redirect }) {
  // pathRedirect(app, route, redirect);

  if (route.name === 'submit-google-auth') {
    return;
  }
  if (app.isAdministration()) {
    return;
  } else if (
    app.$auth.user &&
    app.$auth.user.position.permissions.some(permission => route.name === permission.value)
  ) {
    return;
  }

  return redirect('/');
}
