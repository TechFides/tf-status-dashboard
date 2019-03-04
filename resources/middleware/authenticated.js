// routes accessibled by role 'admin'
const ADMIN_ROUTES = [
  'project',
  'statistics',
  'users',
  'heatmap',
];

// routes accessibled by role 'user'
const USER_ROUTES = [
  'statistics',
];

export default function ({app, store, route, redirect}) {
  if (!ADMIN_ROUTES.includes(route.name) && !USER_ROUTES.includes(route.name)) {
    return;
  } else if (ADMIN_ROUTES.includes(route.name) && app.isAdmin()) {
    return;
  } else if (USER_ROUTES.includes(route.name) && app.isUser()) {
    return;
  }

  return redirect('/');
};
