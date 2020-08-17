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
const AUTH = 'auth';
const ADMIN = [AUTH, 'is:admin'];

/**
 * AUTH
 */
Route.post('/api/auth/login', 'AuthController.login')
  .validator('LoginValidator');
Route.post('/api/auth/logout', 'AuthController.logout');
Route.get('/api/auth/me', 'AuthController.me');

/**
 * ALLY
 */
Route
  .get('/auth/google', 'GoogleLoginController.redirect');
Route
  .get('/authenticated/google', 'GoogleLoginController.callback');

/**
 * CONFIGURATION
 */
Route.get('/api/configuration', 'SystemParamsController.getSystemParams').middleware(ADMIN);
Route.post('/api/configuration', 'SystemParamsController.setSystemParams').middleware(ADMIN);

/**
 * HEATMAP
 */
Route
  .post('/api/feedback', 'FeedbackController.createFeedback');
Route
  .get('/api/heatmap/feedbacks', 'UserController.getUsersFeedbacks')
  .middleware(['auth', 'is:admin']);
Route
  .get('/api/heatmap', 'HeatmapController.getHeatmapWeeks')
  .middleware(ADMIN);

/**
 * MEETING TIMES
 */
Route
  .get('/api/meeting-times', 'MeetingTimeController.getMeetingTimes');
Route
  .post('/api/meeting-times', 'MeetingTimeController.createMeetingTime')
  .validator('StoreMeetingTimeValidator')
  .middleware(ADMIN);
Route
  .put('/api/meeting-times/:id', 'MeetingTimeController.editMeetingTime')
  .validator('StoreMeetingTimeValidator')
  .middleware(ADMIN);
Route
  .delete('/api/meeting-times/:id', 'MeetingTimeController.deleteMeetingTime')
  .middleware(ADMIN);

/**
 * NOTES
 */
Route
  .get('/api/notes', 'NoteController.getNotes')
  .middleware(AUTH);
Route
  .post('/api/notes', 'NoteController.createNote')
  .validator('StoreNoteValidator')
  .middleware(AUTH);
Route
  .put('/api/notes/:id', 'NoteController.editNote')
  .validator('StoreNoteValidator')
  .middleware(AUTH);
Route
  .post('/api/notes/:id/completed', 'NoteController.markCompleted')
  .middleware(AUTH);

/**
 * PROJECTS
 */
Route
  .get('/api/projects', 'ProjectController.getProjects')
  .middleware(AUTH);
Route
  .put('/api/projects/teamLeader', 'ProjectController.addTeamLeader')
  .middleware(AUTH);
Route
  .post('/api/projects', 'ProjectController.createProject')
  .validator('StoreProjectValidator')
  .middleware(ADMIN);
Route
  .put('/api/projects/:id', 'ProjectController.editProject')
  .validator('StoreProjectValidator')
  .middleware(ADMIN);
Route
  .delete('/api/projects/:id', 'ProjectController.deleteProject')
  .middleware(ADMIN);

/**
 * PROJECT RATINGS
 */
Route
  .get('/api/projectRatings', 'ProjectRatingController.getProjectRatings')
  .middleware(AUTH);
Route
  .post('/api/projectRatings', 'ProjectRatingController.setProjectRating')
  .middleware(AUTH);

/**
 * STANDUPS
 */
Route
  .get('/api/standups', 'StandupController.getStandups')
  .middleware(AUTH);
Route
  .post('/api/standups', 'StandupController.createStandup')
  .middleware(ADMIN);
Route
  .delete('/api/standups/:id', 'StandupController.deleteStandup')
  .middleware(ADMIN);
Route
  .put('/api/standups/:id', 'StandupController.editStandup')
  .middleware(ADMIN);

/**
 * STATISTICS
 */
Route
  .get('/api/statistics/projects', 'StatisticsController.getProjectStatistics')
  .middleware(AUTH);
Route
  .post('/api/statistics/user', 'StatisticsController.addUserBonusXp')
  .middleware(ADMIN);
Route
  .get('/api/statistics/data', 'JiraController.fetchData')
  .middleware(ADMIN);

/**
 * OFFICE ABSENCE
 */
Route
  .get('/api/officeAbsences', 'OfficeAbsenceController.getOfficeAbsences')
  .middleware(AUTH);

Route
  .get('/api/officeAbsences/typeEnums', 'OfficeAbsenceController.getAbsenceTypeEnums')
  .middleware(AUTH);

Route
  .get('/api/officeAbsences/stateEnums', 'OfficeAbsenceController.getAbsenceStateEnums')
  .middleware(AUTH);

Route
  .get('/api/officeAbsences/approvers', 'OfficeAbsenceController.getApprovers')
  .middleware(AUTH);

Route
  .post('/api/officeAbsence', 'OfficeAbsenceController.createOfficeAbsence')
  .middleware(AUTH);

Route
  .post('/api/officeAbsence/approveAbsenceState', 'OfficeAbsenceController.approveAbsenceState')
  .middleware(AUTH);

Route
  .post('/api/officeAbsence/rejectAbsenceState', 'OfficeAbsenceController.rejectAbsenceState')
  .middleware(AUTH);

Route
  .post('/api/officeAbsences/cancelOfficeAbsence', 'OfficeAbsenceController.cancelOfficeAbsence')
  .middleware(AUTH);

Route
  .delete('/api/officeAbsences/:id', 'OfficeAbsenceController.deleteOfficeAbsence')
  .middleware(AUTH);

/**
 * USERS
 */
Route
  .get('/api/users', 'UserController.getUsers')
  .middleware(ADMIN);
Route
  .post('/api/users', 'UserController.createUser')
  .validator('StoreUserValidator')
  .middleware(ADMIN);
Route
  .put('/api/users/:id', 'UserController.editUser')
  .validator('StoreUserValidator')
  .middleware(ADMIN);
Route
  .delete('/api/users/:id', 'UserController.deleteUser')
  .middleware(ADMIN);

/**
 * ROLES
 */
Route
  .get('/api/roles', 'RoleController.getRoles');

Route
  .any('*', 'NuxtController.render');
