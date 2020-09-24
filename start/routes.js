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
const Logger = use('Logger');

const AUTH = 'auth';

/**
 * AUTH
 */
Route.post('/api/auth/login', 'AuthController.login').validator('LoginValidator');
Route.post('/api/auth/logout', 'AuthController.logout');
Route.get('/api/auth/me', 'AuthController.me');

/**
 * ALLY
 */
Route.get('/auth/google', 'GoogleLoginController.redirect');
Route.get('/authenticated/google', 'GoogleLoginController.callback');

/**
 * CONFIGURATION
 */
Route.get('/api/configuration', 'SystemParamsController.getSystemParams').middleware([AUTH, 'authorization:admin']);
Route.post('/api/configuration', 'SystemParamsController.setSystemParams').middleware([AUTH, 'authorization:admin']);

/**
 * HEATMAP
 */
Route.post('/api/feedback', 'FeedbackController.createFeedback');
Route.get('/api/heatmap/feedbacks', 'UserController.getUsersFeedbacks').middleware([AUTH, 'authorization:admin']);
Route.get('/api/heatmap', 'HeatmapController.getHeatmapWeeks').middleware([AUTH, 'authorization:admin']);

/**
 * MEETING TIMES
 */
Route.get('/api/meeting-times', 'MeetingTimeController.getMeetingTimes');
Route.post('/api/meeting-times', 'MeetingTimeController.createMeetingTime')
  .validator('StoreMeetingTimeValidator')
  .middleware([AUTH, 'authorization:admin']);
Route.put('/api/meeting-times/:id', 'MeetingTimeController.editMeetingTime')
  .validator('StoreMeetingTimeValidator')
  .middleware([AUTH, 'authorization:admin']);
Route.delete('/api/meeting-times/:id', 'MeetingTimeController.deleteMeetingTime').middleware([
  AUTH,
  'authorization:admin',
]);

/**
 * NOTES
 */
Route.get('/api/notes', 'NoteController.getNotes').middleware(AUTH);
Route.post('/api/notes', 'NoteController.createNote')
  .validator('StoreNoteValidator')
  .middleware(AUTH);
Route.put('/api/notes/:id', 'NoteController.editNote')
  .validator('StoreNoteValidator')
  .middleware(AUTH);
Route.post('/api/notes/:id/completed', 'NoteController.markCompleted').middleware(AUTH);

/**
 * PROJECTS
 */
Route.get('/api/projects', 'ProjectController.getProjects').middleware(AUTH);
Route.put('/api/projects/teamLeader', 'ProjectController.addTeamLeader').middleware([AUTH, 'authorization:admin']);
Route.post('/api/projects', 'ProjectController.createProject')
  .validator('StoreProjectValidator')
  .middleware([AUTH, 'authorization:admin']);
Route.put('/api/projects/:id', 'ProjectController.editProject')
  .validator('StoreProjectValidator')
  .middleware([AUTH, 'authorization:admin']);
Route.delete('/api/projects/:id', 'ProjectController.deleteProject').middleware([AUTH, 'authorization:admin']);

/**
 * PROJECT RATINGS
 */
Route.get('/api/projectRatings', 'ProjectRatingController.getProjectRatings').middleware(AUTH);
Route.post('/api/projectRatings', 'ProjectRatingController.setProjectRating').middleware(AUTH);

/**
 * STANDUPS
 */
Route.get('/api/standups', 'StandupController.getStandups').middleware(AUTH);
Route.post('/api/standups', 'StandupController.createStandup').middleware([AUTH, 'authorization:admin']);
Route.delete('/api/standups/:id', 'StandupController.deleteStandup').middleware([AUTH, 'authorization:admin']);
Route.put('/api/standups/:id', 'StandupController.editStandup').middleware([AUTH, 'authorization:admin']);

/**
 * STATISTICS
 */
Route.get('/api/statistics/projects', 'StatisticsController.getProjectStatistics').middleware(AUTH);
Route.post('/api/statistics/bonus-xp', 'StatisticsController.addUserBonusXp').middleware([AUTH, 'authorization:admin']);
Route.get('/api/statistics/data', 'JiraController.fetchData').middleware([AUTH, 'authorization:admin']);

/**
 * OFFICE ABSENCE
 */
Route.get('/api/office-absences', 'OfficeAbsenceController.getOfficeAbsenceList').middleware(AUTH);
Route.get('/api/office-absence/:id', 'OfficeAbsenceController.getOfficeAbsence').middleware([
  AUTH,
  'authorization:admin',
]);
Route.get('/api/office-absences/type-enums', 'OfficeAbsenceController.getAbsenceTypeEnums').middleware(AUTH);
Route.get('/api/office-absences/state-enums', 'OfficeAbsenceController.getAbsenceStateEnums').middleware(AUTH);
Route.get('/api/office-absences/approvers', 'OfficeAbsenceController.getApprovers').middleware(AUTH);
Route.get('/api/office-absences/changes', 'OfficeAbsenceController.getOfficeAbsenceChanges').middleware([
  AUTH,
  'authorization:admin',
]);

Route.post('/api/office-absence', 'OfficeAbsenceController.createOfficeAbsence').middleware(AUTH);
Route.post('/api/office-absence/approve-absence-state', 'OfficeAbsenceController.approveAbsenceState');
Route.post('/api/office-absence/reject-absence-state', 'OfficeAbsenceController.rejectAbsenceState');
Route.post('/api/office-absences/cancel', 'OfficeAbsenceController.cancelOfficeAbsence').middleware(AUTH);
Route.delete('/api/office-absences/:id', 'OfficeAbsenceController.deleteOfficeAbsence').middleware(AUTH);

/**
 * WORK LOGS
 */
Route.get('/api/work-logs', 'WorkLogController.getWorkLogList').middleware(AUTH);
Route.post('/api/work-log', 'WorkLogController.createWorkLog').middleware(AUTH);
Route.put('/api/work-log/:id', 'WorkLogController.editWorkLog').middleware([AUTH, 'authorization:admin']);
Route.delete('/api/work-logs/:id', 'WorkLogController.deleteWorkLog').middleware(AUTH);

/**
 * USERS
 */
Route.get('/api/users', 'UserController.getUsers').middleware(AUTH);
Route.post('/api/users/synchronization', 'UserController.userSynchronization').middleware([
  AUTH,
  'authorization:admin',
]);
Route.post('/api/users/set-admin/:id', 'UserController.setAdmin').middleware([AUTH, 'authorization:admin']);
Route.post('/api/users/set-approver/:id', 'UserController.setApprover').middleware([AUTH, 'authorization:admin']);

/**
 * POSITIONS
 */
Route.get('/api/positions', 'PositionController.getPositions').middleware(AUTH);
Route.post('/api/positions/synchronization', 'PositionController.positionSynchronization').middleware([
  AUTH,
  'authorization:admin',
]);
Route.post('/api/positions/set-permissions/:id', 'PositionController.setPermissions').middleware(AUTH);
Route.post('/api/positions/set-feedback/:id', 'PositionController.setFeedback').middleware(AUTH);
Route.post('/api/positions/set-player/:id', 'PositionController.setPlayer').middleware(AUTH);

/**
 * PERMISSIONS
 */
Route.get('/api/permissions', 'PermissionController.getPermissions').middleware(AUTH);

/**
 * COST CATEGORIES
 */
Route.get('/api/cost-categories', 'CostCategoryController.getCostCategories').middleware(AUTH);
Route.post('/api/cost-categories/synchronization', 'CostCategoryController.costCategorySynchronization').middleware([
  AUTH,
  'authorization:admin',
]);

Route.any('*', 'NuxtController.render');
