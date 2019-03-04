'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

const Route = use('Route');

/**
 * AUTH
 */
Route.post('/api/auth/login', 'AuthController.login')
  .validator('LoginValidator');
Route.post('/api/auth/logout', 'AuthController.logout');
Route.get('/api/auth/me', 'AuthController.me');

/**
 * FEEDBACKS
 */
Route
  .get('/api/usersfeedbacks', 'UserController.getUsersFeedbacks')
  .middleware(['auth', 'is:admin']);
/**
 * NOTES
 */
Route
  .get('/api/notes', 'NoteController.getNotes');
Route
  .post('/api/notes', 'NoteController.createNote')
  .validator('StoreNoteValidator')
  .middleware('auth');
Route
  .put('/api/notes/:id', 'NoteController.editNote')
  .validator('StoreNoteValidator')
  .middleware('auth');
Route
  .post('/api/notes/:id/completed', 'NoteController.markCompleted')
  .middleware('auth');

/**
 * PROJECTS
 */
Route
  .get('/api/projects', 'ProjectController.getProjects');
Route
  .post('/api/projects', 'ProjectController.createProject')
  .validator('StoreProjectValidator')
  .middleware(['auth', 'is:admin']);
Route
  .put('/api/projects/:id', 'ProjectController.editProject')
  .validator('StoreProjectValidator')
  .middleware(['auth', 'is:admin']);
Route
  .delete('/api/projects/:id', 'ProjectController.deleteProject')
  .middleware(['auth', 'is:admin']);

/**
 * PROJECT RATINGS
 */
Route
  .get('/api/projectRatings', 'ProjectRatingController.getProjectRatings');
Route
  .post('/api/projectRatings', 'ProjectRatingController.setProjectRating')
  .middleware('auth');

/**
 * STANDUPS
 */
Route
  .get('/api/standups', 'StandupController.getStandups');
Route
  .post('/api/standups', 'StandupController.createStandup')
  .middleware(['auth', 'is:admin']);
Route
  .delete('/api/standups/:id', 'StandupController.deleteStandup')
  .middleware(['auth', 'is:admin']);
Route
  .put('/api/standups/:id', 'StandupController.editStandup')
  .middleware(['auth', 'is:admin']);

/**
 * STATISTICS
 */
Route
  .get('/api/statistics/projects', 'StatisticsController.getProjectStatistics')
  .middleware('auth');

/**
 * USERS
 */
Route
  .get('/api/users', 'UserController.getUsers')
  .middleware(['auth', 'is:admin']);
Route
  .post('/api/users', 'UserController.createUser')
  .validator('StoreUserValidator')
  .middleware(['auth', 'is:admin']);
Route
  .put('/api/users/:id', 'UserController.editUser')
  .validator('StoreUserValidator')
  .middleware(['auth', 'is:admin']);
Route
  .delete('/api/users/:id', 'UserController.deleteUser')
  .middleware(['auth', 'is:admin']);

/**
 * ROLES
 */
Route
  .get('/api/roles', 'RoleController.getRoles');

Route
  .any('*', 'NuxtController.render');
