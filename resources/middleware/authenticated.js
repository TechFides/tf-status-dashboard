import { pathRedirect } from '../utils/pathRedirect';

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

// routes accessibled by role 'realization'
const REALIZATION_ROUTES = [
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
  pathRedirect(app, route, redirect);

  if (!ADMINISTRATION_ROUTES.includes(route.name) && !REALIZATION_ROUTES.includes(route.name) && !SALES_ROUTES.includes(route.name) && !HR_ROUTES.includes(route.name)) {
    return;
  } else if (ADMINISTRATION_ROUTES.includes(route.name) && app.isAdministration()) {
    return;
  } else if (REALIZATION_ROUTES.includes(route.name) && app.isRealization()) {
    return;
  } else if (SALES_ROUTES.includes(route.name) && app.isSales()) {
    return;
  } else if (HR_ROUTES.includes(route.name) && app.isHR()) {
    return;
  }

  return redirect('/');
};
