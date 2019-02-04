
export default function ({app, store, route, redirect}) {
  if (route.name === 'projects' && !app.isAdmin()) {
    return redirect('/');
  }
  if (route.name === 'statistics' && !(app.isAdmin() || app.isUser())) {
    return redirect('/');
  }
  if (route.name === 'users' && !app.isAdmin()) {
    return redirect('/');
  }
};
