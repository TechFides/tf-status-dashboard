const ROOT_ROUTE = 'index';

export const pathRedirect = (app, route, redirect) => {
  if (route.name === ROOT_ROUTE && (app.isHR() || app.isSales())) {
    return redirect('/office-absences');
  }
};
