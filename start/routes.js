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
const ADMIN = [AUTH, 'is:administration'];

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
  .middleware(ADMIN);
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
  .post('/api/statistics/bonus-xp', 'StatisticsController.addUserBonusXp')
  .middleware(ADMIN);
Route
  .get('/api/statistics/data', 'JiraController.fetchData')
  .middleware(ADMIN);

/**
 * OFFICE ABSENCE
 */
Route
  .get('/api/office-absences', 'OfficeAbsenceController.getOfficeAbsenceList')
  .middleware(AUTH);

Route
  .get('/api/office-absence/:id', 'OfficeAbsenceController.getOfficeAbsence')
  .middleware(ADMIN);

Route
  .get('/api/office-absences/type-enums', 'OfficeAbsenceController.getAbsenceTypeEnums')
  .middleware(AUTH);

Route
  .get('/api/office-absences/state-enums', 'OfficeAbsenceController.getAbsenceStateEnums')
  .middleware(AUTH);

Route
  .get('/api/office-absences/approvers', 'OfficeAbsenceController.getApprovers')
  .middleware(AUTH);

Route
  .get('/api/office-absences/changes', 'OfficeAbsenceController.getOfficeAbsenceChanges')
  .middleware(ADMIN);

Route
  .post('/api/office-absence', 'OfficeAbsenceController.createOfficeAbsence')
  .middleware(AUTH);

Route
  .post('/api/office-absence/approve-absence-state', 'OfficeAbsenceController.approveAbsenceState')

Route
  .post('/api/office-absence/reject-absence-state', 'OfficeAbsenceController.rejectAbsenceState')

Route
  .post('/api/office-absences/cancel', 'OfficeAbsenceController.cancelOfficeAbsence')
  .middleware(AUTH);

Route
  .delete('/api/office-absences/:id', 'OfficeAbsenceController.deleteOfficeAbsence')
  .middleware(AUTH);

/**
 * WORK LOGS
 */
Route
  .get('/api/work-logs', 'WorkLogController.getWorkLogList')
  .middleware(AUTH);

Route
  .post('/api/work-log', 'WorkLogController.createWorkLog')
  .middleware(AUTH);

Route
  .put('/api/work-log/:id', 'WorkLogController.editWorkLog')
  .middleware(ADMIN);

Route
  .delete('/api/work-logs/:id', 'WorkLogController.deleteWorkLog')
  .middleware(AUTH);

/**
 * USERS
 */
Route
  .get('/api/users', 'UserController.getUsers')
  .middleware(AUTH);
Route
  .post('/api/users/synchronization', 'UserController.userSynchronization')
  .middleware(ADMIN);
Route
  .post('/api/users/set-admin/:id', 'UserController.setAdmin')
  .middleware(ADMIN);
Route
  .post('/api/users/set-approver/:id', 'UserController.setApprover')
  .middleware(ADMIN);

/**
 * POSITIONS
 */
Route
  .get('/api/positions', 'PositionController.getPositions')
  .middleware(AUTH);
Route
  .post('/api/positions/synchronization', 'PositionController.positionSynchronization')
  .middleware(ADMIN);
Route
  .post('/api/positions/set-permissions/:id', 'PositionController.setPermissions')
  .middleware(AUTH);

/**
 * PERMISSIONS
 */
Route
  .get('/api/permissions', 'PermissionController.getPermissions')
  .middleware(AUTH);

/**
 * COST CATEGORIES
 */
Route
  .get('/api/cost-categories', 'CostCategoryController.getCostCategories')
  .middleware(AUTH);
Route
  .post('/api/cost-categories/synchronization', 'CostCategoryController.costCategorySynchronization')
  .middleware(ADMIN);

/**
 * ROLES
 */
Route
  .get('/api/roles', 'RoleController.getRoles');

Route
  .any('*', 'NuxtController.render');
