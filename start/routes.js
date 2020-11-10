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
const AUTHORIZATION_ADMIN = 'authorization:sitdown';
const AUTHORIZATION_SITDOWN = 'authorization:sitdown';
const AUTHORIZATION_HEATMAP = 'authorization:heatmap';
const AUTHORIZATION_PROJECTS = 'authorization:projects';
const AUTHORIZATION_OFFICE_ABSENCES = 'authorization:office-absences';
const AUTHORIZATION_GAME = 'authorization:game';
const AUTHORIZATION_WORK_LOG = 'authorization:work-logs';
const AUTHORIZATION_USERS = 'authorization:users';
const AUTHORIZATION_POSITIONS = 'authorization:positions';
const AUTHORIZATION_MEETING_TIMES = 'authorization:meeting-times';
const AUTHORIZATION_CONFIGURATION = 'authorization:configuration';
const AUTHORIZATION_SITDOWN_RATING = 'authorization:sitdown-rating';
const AUTHORIZATION_MANAGE_GAME = 'authorization:manage-game';
const AUTHORIZATION_MANAGE_PROJECT_NOTES = 'authorization:manage-project-notes';
const AUTHORIZATION_MANAGE_SITDOWNS = 'authorization:manage-sitdowns';

/******************************************************************************
 * AUTH
 *****************************************************************************/
Route.post('/api/auth/login', 'AuthController.login').validator('LoginValidator');
Route.post('/api/auth/logout', 'AuthController.logout');
Route.get('/api/auth/me', 'AuthController.me');

/******************************************************************************
 * ALLY
 *****************************************************************************/
Route.get('/auth/google', 'GoogleLoginController.redirect');
Route.get('/authenticated/google', 'GoogleLoginController.callback');
Route.get('/auth/google/register-token', 'GoogleLoginController.registerToken');

/******************************************************************************
 * CONFIGURATION
 *****************************************************************************/
Route.get('/api/configuration', 'SystemParamsController.getSystemParams').middleware([
  AUTH,
  AUTHORIZATION_CONFIGURATION,
]);
Route.post('/api/configuration', 'SystemParamsController.setSystemParams').middleware([
  AUTH,
  AUTHORIZATION_CONFIGURATION,
]);

/******************************************************************************
 * HEATMAP
 *****************************************************************************/
Route.post('/api/feedback', 'FeedbackController.createFeedback');
Route.get('/api/heatmap/feedbacks', 'UserController.getUsersFeedbacks').middleware([AUTH, AUTHORIZATION_HEATMAP]);
Route.get('/api/heatmap', 'HeatmapController.getHeatmapWeeks').middleware([AUTH, AUTHORIZATION_HEATMAP]);

/******************************************************************************
 * MEETING TIMES
 *****************************************************************************/
Route.get('/api/meeting-times', 'MeetingTimeController.getMeetingTimes');
Route.post('/api/meeting-times', 'MeetingTimeController.createMeetingTime')
  .validator('StoreMeetingTimeValidator')
  .middleware([AUTH, AUTHORIZATION_MEETING_TIMES]);
Route.put('/api/meeting-times/:id', 'MeetingTimeController.editMeetingTime')
  .validator('StoreMeetingTimeValidator')
  .middleware([AUTH, AUTHORIZATION_MEETING_TIMES]);
Route.delete('/api/meeting-times/:id', 'MeetingTimeController.deleteMeetingTime').middleware([
  AUTH,
  AUTHORIZATION_MEETING_TIMES,
]);

/******************************************************************************
 * NOTES
 *****************************************************************************/
Route.get('/api/notes', 'NoteController.getNotes').middleware([AUTH, AUTHORIZATION_SITDOWN]);
Route.get('/api/notes', 'NoteController.getNotes').middleware([AUTH, AUTHORIZATION_SITDOWN]);
Route.post('/api/notes', 'NoteController.createNote')
  .validator('StoreNoteValidator')
  .middleware([AUTH, AUTHORIZATION_MANAGE_PROJECT_NOTES]);
Route.put('/api/notes/:id', 'NoteController.editNote')
  .validator('StoreNoteValidator')
  .middleware([AUTH, AUTHORIZATION_MANAGE_PROJECT_NOTES]);
Route.post('/api/notes/:id/completed', 'NoteController.markCompleted').middleware([
  AUTH,
  AUTHORIZATION_MANAGE_PROJECT_NOTES,
]);

/******************************************************************************
 * PROJECTS
 *****************************************************************************/
Route.get('/api/projects', 'ProjectController.getProjects').middleware(AUTH);
Route.put('/api/projects/teamLeader', 'ProjectController.addTeamLeader').middleware([AUTH, AUTHORIZATION_PROJECTS]);
Route.post('/api/projects', 'ProjectController.createProject')
  .validator('StoreProjectValidator')
  .middleware([AUTH, AUTHORIZATION_PROJECTS]);
Route.put('/api/projects/:id', 'ProjectController.editProject')
  .validator('StoreProjectValidator')
  .middleware([AUTH, AUTHORIZATION_PROJECTS]);
Route.delete('/api/projects/:id', 'ProjectController.deleteProject').middleware([AUTH, AUTHORIZATION_PROJECTS]);

/******************************************************************************
 * PROJECT RATINGS
 *****************************************************************************/
Route.get('/api/projectRatings', 'ProjectRatingController.getProjectRatings').middleware([AUTH, AUTHORIZATION_SITDOWN]);
Route.post('/api/projectRatings', 'ProjectRatingController.setProjectRating').middleware([
  AUTH,
  AUTHORIZATION_SITDOWN_RATING,
]);

/******************************************************************************
 * SITDOWNS
 *****************************************************************************/
Route.get('/api/sitdowns', 'SitdownController.getSitdowns').middleware([AUTH, AUTHORIZATION_SITDOWN]);
Route.post('/api/sitdowns', 'SitdownController.createSitdown').middleware([AUTH, AUTHORIZATION_MANAGE_SITDOWNS]);
Route.delete('/api/sitdowns/:id', 'SitdownController.deleteSitdown').middleware([AUTH, AUTHORIZATION_MANAGE_SITDOWNS]);
Route.put('/api/sitdowns/:id', 'SitdownController.editSitdown').middleware([AUTH, AUTHORIZATION_MANAGE_SITDOWNS]);

/******************************************************************************
 * STATISTICS
 *****************************************************************************/
Route.get('/api/statistics/projects', 'StatisticsController.getProjectStatistics').middleware(AUTH, AUTHORIZATION_GAME);
Route.post('/api/statistics/bonus-xp', 'StatisticsController.addUserBonusXp').middleware([
  AUTH,
  AUTHORIZATION_MANAGE_GAME,
]);
Route.get('/api/statistics/data', 'JiraController.fetchData').middleware([AUTH, AUTHORIZATION_MANAGE_GAME]);

/******************************************************************************
 * OFFICE ABSENCE
 *****************************************************************************/
Route.get('/api/office-absences', 'OfficeAbsenceController.getOfficeAbsenceList').middleware([
  AUTH,
  AUTHORIZATION_OFFICE_ABSENCES,
]);
Route.get('/api/office-absence/:id', 'OfficeAbsenceController.getOfficeAbsence');
Route.get('/api/office-absences/type-enums', 'OfficeAbsenceController.getAbsenceTypeEnums').middleware([
  AUTH,
  AUTHORIZATION_OFFICE_ABSENCES,
]);
Route.get('/api/office-absences/state-enums', 'OfficeAbsenceController.getAbsenceStateEnums').middleware([
  AUTH,
  AUTHORIZATION_OFFICE_ABSENCES,
]);
Route.get('/api/office-absences/approvers', 'OfficeAbsenceController.getApprovers').middleware([
  AUTH,
  AUTHORIZATION_OFFICE_ABSENCES,
]);
Route.get('/api/office-absences/changes', 'OfficeAbsenceController.getOfficeAbsenceChanges').middleware([
  AUTH,
  AUTHORIZATION_OFFICE_ABSENCES,
]);

Route.post('/api/office-absence', 'OfficeAbsenceController.createOfficeAbsence').middleware([
  AUTH,
  AUTHORIZATION_OFFICE_ABSENCES,
]);
Route.post('/api/office-absence/approve-absence-state', 'OfficeAbsenceController.approveAbsenceState');
Route.post('/api/office-absence/reject-absence-state', 'OfficeAbsenceController.rejectAbsenceState');
Route.post('/api/office-absences/cancel', 'OfficeAbsenceController.cancelOfficeAbsence').middleware([
  AUTH,
  AUTHORIZATION_OFFICE_ABSENCES,
]);
Route.delete('/api/office-absences/:id', 'OfficeAbsenceController.deleteOfficeAbsence').middleware([
  AUTH,
  AUTHORIZATION_OFFICE_ABSENCES,
]);

/******************************************************************************
 * WORK LOGS
 *****************************************************************************/
Route.get('/api/work-logs', 'WorkLogController.getWorkLogList').middleware([AUTH, AUTHORIZATION_WORK_LOG]);
Route.post('/api/work-log', 'WorkLogController.createWorkLog').middleware([AUTH, AUTHORIZATION_WORK_LOG]);
Route.put('/api/work-log/:id', 'WorkLogController.editWorkLog').middleware([AUTH, AUTHORIZATION_WORK_LOG]);
Route.delete('/api/work-logs/:id', 'WorkLogController.deleteWorkLog').middleware([AUTH, AUTHORIZATION_WORK_LOG]);

/******************************************************************************
 * USERS
 *****************************************************************************/
Route.get('/api/users', 'UserController.getUsers').middleware(AUTH);
Route.post('/api/users/synchronization', 'UserController.userSynchronization').middleware([AUTH, AUTHORIZATION_USERS]);
Route.post('/api/users/set-admin/:id', 'UserController.setAdmin').middleware([AUTH]);
Route.post('/api/users/set-approver/:id', 'UserController.setApprover').middleware([AUTH, AUTHORIZATION_USERS]);

/******************************************************************************
 * POSITIONS
 *****************************************************************************/
Route.get('/api/positions', 'PositionController.getPositions').middleware(AUTH);
Route.post('/api/positions/synchronization', 'PositionController.positionSynchronization').middleware([
  AUTH,
  AUTHORIZATION_POSITIONS,
]);
Route.post('/api/positions/set-permissions/:id', 'PositionController.setPermissions').middleware([
  AUTH,
  AUTHORIZATION_POSITIONS,
]);
Route.post('/api/positions/set-feedback/:id', 'PositionController.setFeedback').middleware([
  AUTH,
  AUTHORIZATION_POSITIONS,
]);
Route.post('/api/positions/set-player/:id', 'PositionController.setPlayer').middleware([AUTH, AUTHORIZATION_POSITIONS]);

/******************************************************************************
 * PERMISSIONS
 *****************************************************************************/
Route.get('/api/permissions', 'PermissionController.getPermissions').middleware(AUTH);

/******************************************************************************
 * COST CATEGORIES
 *****************************************************************************/
Route.get('/api/cost-categories', 'CostCategoryController.getCostCategories').middleware(AUTH);
Route.post('/api/cost-categories/synchronization', 'CostCategoryController.costCategorySynchronization').middleware([
  AUTH,
  AUTHORIZATION_POSITIONS,
]);

Route.any('*', 'NuxtController.render');
