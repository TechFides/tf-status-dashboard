// routes accessibled by role 'administration'
const ADMINISTRATION_ROUTES = [
  'standup',
  'project',
  'office-absences',
  'work-logs',
  'meeting-times',
  'statistics',
  'users',
  'heatmap',
  'settings',
];

// routes accessibled by role 'production'
const PRODUCTION_ROUTES = [
  'standup',
  'office-absences',
  'statistics',
];

// routes accessibled by role 'sales'
const SALES_ROUTES = [
  'office-absences',
  'work-logs',
];

// routes accessibled by role 'HR'
const HR_ROUTES = [
  'office-absences',
  'work-logs',
];

export default function ({ app, store, route, redirect }) {
  if (!ADMINISTRATION_ROUTES.includes(route.name) && !PRODUCTION_ROUTES.includes(route.name) && !SALES_ROUTES.includes(route.name) && !HR_ROUTES.includes(route.name)) {
    return;
  } else if (ADMINISTRATION_ROUTES.includes(route.name) && app.isAdministration()) {
    return;
  } else if (PRODUCTION_ROUTES.includes(route.name) && app.isProduction()) {
    return;
  } else if (SALES_ROUTES.includes(route.name) && app.isSales()) {
    return;
  } else if (HR_ROUTES.includes(route.name) && app.isHR()) {
    return;
  }

  return redirect('/');
};
