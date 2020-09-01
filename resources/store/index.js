import { WEEK_DAYS, WEEK_DAYS_SHORTHAND } from '../constants';
import moment from 'moment';

const NOTIFICATION_TIMEOUT = 4000;

export const state = () => ({
  notes: [],
  projects: [],
  allProjects: [],
  projectStatistics: [],
  standups: [],
  standupRatings: {},
  officeAbsences: [],
  absenceTypeEnums: [],
  absenceStateEnums: [],
  approvers: [],
  users: [],
  roles: [],
  usersFeedbacks: [],
  heatmapWeeks: [],
  error: {
    isVisible: false,
    message: '',
    field: '',
    validation: '',
  },
  snackbar: {
    isVisible: false,
    message: '',
    color: '',
  },
  notificationTimeout: null,
  meetingTimes: [],
  workLogs: {
    items: [],
    timeSpentSum: '',
  },
  costCategories: [],
});

const sortAscByProperty = function (property, a, b) {
  return a[property] > b[property] ? 1
    : a[property] === b[property] ? 0 : -1;
};

const sortDesByProperty = function (property, a, b) {
  return a[property] < b[property] ? 1
    : a[property] === b[property] ? 0 : -1;
};

const getDateParams = function (date = new Date()) {
  return {
    params: {
      month: date.getMonth(),
      year: date.getFullYear(),
    },
  };
};

const getProjectParams = () => {
  return {
    params: {
      isActive: true,
    },
  };
};

const getHeatmapParams = () => {
  return {
    params: {
      isActive: true,
    },
  };
};

const calculateLevel = (totalExp) => {
  const d = -500 + Math.sqrt(500 * 500 + 4 * 5 * totalExp);
  const result = d / (2 * 5);

  return Math.floor(result);
};

const getTimeSpent = (value)  => {
  let timeSpent;

  if (value < 60) {
    timeSpent = value + 'm';
  } else if (value % 60 === 0) {
    timeSpent = (value / 60) + 'h';
  } else {
    timeSpent = `${Math.floor(value / 60)}h ${(value % 60)}m`;
  }

  return timeSpent;
};

const filterProjectsByRatings = (projects, ratings, date) => {
  const allowedProjectIds = {};
  const currentDate = new Date();

  for (const { standupProjectRating } of ratings) {
    for (const { project_id: projectId } of standupProjectRating) {
      allowedProjectIds[projectId] = true;
    }
  }

  return date > currentDate ? projects : projects.filter(p => allowedProjectIds[p.id]);
};

const getStandupIndex = (state, standupId) => {
  for (const [index, rating] of state.standupRatings.entries()) {
    if (rating.id === standupId) {
      return index;
    }
  }

  throw new Error('Invalid standup id');
};

const findAndFormatMeetingTimeTextForSelect = (state, meetingTimeId) => {
  const selectedMeetingTime = state.meetingTimes.find(meetingTime => meetingTime.id === meetingTimeId);

  return selectedMeetingTime ? selectedMeetingTime.dayAndTime : '';
};

export const mutations = {
  updateRating (state, { projectId, ratingValueId, standupId }) {
    const standupIndex = getStandupIndex(state, standupId);
    const newStandupRatings = [...state.standupRatings];
    const newRatings = { ...newStandupRatings[standupIndex].standupProjectRating };
    newRatings[projectId] = ratingValueId;
    newStandupRatings[standupIndex].standupProjectRating = newRatings;

    state.standupRatings = newStandupRatings;
  },
  setProjects (state, projects) {
    state.projects = projects.map(p => {
      const meetingTime = state.meetingTimes.find(meetingTime => meetingTime.id === p.meeting_time_id);

      return {
        id: p.id,
        code: p.code,
        description: p.description,
        isActive: p.is_active === 1,
        slackChannelName: p.slackChannel ? p.slackChannel.channel_name : '',
        meetingTime: {
          id: p.meeting_time_id,
          dayAndTime: meetingTime && meetingTime.dayAndTime ? meetingTime.dayAndTime : null,
          time: meetingTime && meetingTime.time ? meetingTime.time : null,
          weekDayId: meetingTime && meetingTime.weekDayId,
        },
      };
    });
  },
  setAllProjects (state, projects) {
    state.allProjects = projects.map(p => ({
      id: p.id,
      code: p.code,
      description: p.description,
      isActive: p.is_active === 1,
      slackChannelName: p.slackChannel ? p.slackChannel.channel_name : '',
      teamLeader: {
        id: p.projectUser ? p.projectUser.user.id : null,
        name: p.projectUser ? `${p.projectUser.user.first_name} ${p.projectUser.user.last_name}` : '',
      },
      meetingTime: {
        text: findAndFormatMeetingTimeTextForSelect(state, p.meeting_time_id),
        value: p.meeting_time_id,
      },
    })).sort(sortAscByProperty.bind(this, 'code'));
  },
  setProjectRatings (state, standupRatings) {
    const newStandupRatings = standupRatings.sort(sortAscByProperty.bind(this, 'date'));
    for (const [index, { standupProjectRating }] of newStandupRatings.entries()) {
      const newRatings = {};
      for (const { project_id: projectId, standup_project_rating_enum_id: standupId } of standupProjectRating) {
        newRatings[projectId] = standupId;
      }

      newStandupRatings[index].standupProjectRating = newRatings;
    }

    state.standupRatings = newStandupRatings;
  },
  setProjectStatistics (state, projectStatistics) {
    state.projectStatistics = projectStatistics;
    const sortedUsersByMonthXp = projectStatistics.userStatistics.sort(sortDesByProperty.bind(this, 'monthXp'));
    state.projectStatistics.heroesOfMonth = [sortedUsersByMonthXp[0], sortedUsersByMonthXp[1], sortedUsersByMonthXp[2], sortedUsersByMonthXp[3]];

    const sortedUsersByTotalXp = projectStatistics.userStatistics.sort(sortDesByProperty.bind(this, 'totalXp'));
    state.projectStatistics.heroesOfGame = [sortedUsersByTotalXp[0], sortedUsersByTotalXp[1]];
  },
  setJiraSynchronizationStatus (state, syncData) {
    state.projectStatistics.jiraSynchronization = {
      status: syncData.status,
      startSyncTime: syncData.startSyncTime,
      lastDuration: syncData.lastDuration,
    };
  },
  setUserBonusXp(state, userStatistic) {
    state.projectStatistics.userStatistics.forEach((el, index) => {
      if (el.id === userStatistic.id) {
        state.projectStatistics.userStatistics[index].bonusXp = userStatistic.bonusXp;
        state.projectStatistics.userStatistics[index].totalXp = userStatistic.totalXp;
        state.projectStatistics.userStatistics[index].newLevel = calculateLevel(userStatistic.totalXp);
        state.projectStatistics.userStatistics[index].monthXp = userStatistic.monthXp;
      }
    });
    const sortedUsersByMonthXp = state.projectStatistics.userStatistics.sort(sortDesByProperty.bind(this, 'monthXp'));
    state.projectStatistics.heroesOfMonth = [sortedUsersByMonthXp[0], sortedUsersByMonthXp[1], sortedUsersByMonthXp[2]];

    const sortedUsersByTotalXp = state.projectStatistics.userStatistics.sort(sortDesByProperty.bind(this, 'totalXp'));
    state.projectStatistics.heroesOfGame = [sortedUsersByTotalXp[0], sortedUsersByTotalXp[1], sortedUsersByTotalXp[2]];
  } ,
  setNotes (state, notes) {
    state.notes = notes.map(n => ({
      id: n.id,
      projectId: n.project.id,
      projectCode: n.project.code,
      deadlineDate: n.deadline,
      created: n.created_at,
      text: n.note,
    })).sort(sortAscByProperty.bind(this, 'projectCode'));
  },
  setOfficeAbsences (state, officeAbsences) {
    state.officeAbsences = officeAbsences.map(o => ({
      id: o.id,
      author: o.user,
      absenceStart: moment(o.absence_start).format('DD.MM.YYYY'),
      absenceStartByNumber: moment(o.absence_start).valueOf(),
      absenceEnd: moment(o.absence_end).format('DD.MM.YYYY'),
      absenceEndByNumber: moment(o.absence_end).valueOf(),
      created: moment(o.created_at).format('DD.MM.YYYY'),
      createdByNumber: moment(o.created_at).valueOf(),
      absenceType: o.absenceTypeEnum,
      absenceState: o.absenceStateEnum,
      absenceApprover: {
        fullName: o.absenceApprover ? `${o.absenceApprover.first_name} ${o.absenceApprover.last_name}` : '',
        id: o.absenceApprover ? o.absenceApprover.id : null,
      },
      absenceHoursNumber: o.absence_hours_number,
      description: o.description,
    }));
  },
  setAbsenceTypeEnums (state, absenceTypeEnums) {
    state.absenceTypeEnums = absenceTypeEnums;
  },
  setAbsenceStateEnums (state, absenceStateEnums) {
    state.absenceStateEnums = absenceStateEnums;
  },
  setApprovers (state, approvers) {
    state.approvers = approvers.map(u => ({
      firstName: u.first_name,
      id: u.id,
      lastName: u.last_name,
      priority: u.priority,
    }));
  },
  setWorkLogs (state, workLogs) {
    state.workLogs.items = workLogs.items.map(w => ({
      id: w.id,
      author: {
        fullName: w.user ? `${w.user .first_name} ${w.user .last_name}` : '',
        id: w.user ? w.user .id : null,
      },
      started: moment(w.started).format('DD.MM.YYYY HH:mm'),
      startedByNumber: moment(w.started).valueOf(),
      timeSpent: getTimeSpent(w.time_spent),
      description: w.description,
      costCategory: {
        id: w.costCategory.id,
        name: w.costCategory.name,
      },
    }));

    state.workLogs.timeSpentSum = getTimeSpent(workLogs.timeSpentSum);
  },
  setCostCategories (state, costCategories) {
    let flat = [];
    for (let i = 0; i < costCategories.data.length; i++) {
      flat = flat.concat(costCategories.data[i].subCategories);
    }
    const flattenArray = flat.concat(costCategories.data).map(f => ({
      hasSubCategory: f.subCategories,
      workCategory: f.workCategory,
      name: f.name,
      id: f.id,
    }));

    state.costCategories = flattenArray.filter(f => !f.hasSubCategory.length && f.workCategory);
  },
  setUsers (state, users) {
    state.users = users.map(u => ({
      firstName: u.first_name,
      id: u.id,
      isActive: u.is_active,
      sendFeedback: u.send_feedback,
      lastName: u.last_name,
      username: u.username,
      email: u.email,
      absenceApprover: {
        id: u.user ? u.user.approver.id : null,
        fullName: u.user ? `${u.user.approver.first_name} ${u.user.approver.last_name}` : '',
      },
      roles: u.roles.map(r => r.slug),
    }));
  },
  setRoles (state, roles) {
    state.roles = roles;
  },
  setUsersFeedbacks (state, userFeedbacks) {
    const newUserFeedbacks = userFeedbacks.sort(sortAscByProperty.bind(this, 'first_name'));
    for (const [index, { feedback }] of newUserFeedbacks.entries()) {
      const newFeedback = {};
      for (const { heatmap_week_id: heatMapId, feedback_enum_id: feedbackId } of feedback) {
        newFeedback[heatMapId] = feedbackId;
      }

      newUserFeedbacks[index].feedback = newFeedback;
    }

    state.usersFeedbacks = newUserFeedbacks;
  },
  setHeatmapWeeks (state, heatmap) {
    state.heatmapWeeks = heatmap.sort(sortAscByProperty.bind(this, 'date'));
  },
  setMeetingTimes (state, meetingTimes) {
    state.meetingTimes = meetingTimes.map(
      meetingTime => {
        const timeWithoutSeconds = meetingTime.time.substring(0, 5);

        return {
          id: meetingTime.id,
          name: meetingTime.name,
          projects: meetingTime.projects.map(({ code }) => code).join(', '),
          time: timeWithoutSeconds,
          weekDayId: Number(meetingTime.week_day),
          weekDay: WEEK_DAYS[meetingTime.week_day],
          dayAndTime: `${WEEK_DAYS_SHORTHAND[meetingTime.week_day]} ${timeWithoutSeconds}`,
        };
      });
  },
  setErrorState (state, errorObj) {
    state.error = {
      isVisible: true,
      message: errorObj.message ? errorObj.message : '',
    };
  },
  clearErrorState (state) {
    state.error = {
      isVisible: false,
      message: '',
    };
  },
  setNotification (state, notification) {
    if (state.notificationTimeout) {
      this.commit('clearNotification');
    }

    state.snackbar = {
      isVisible: true,
      message: notification.message ? notification.message : '',
      color: notification.color ? notification.color : '',
    };

    state.notificationTimeout = setTimeout(() => {
      this.commit('clearNotification');
    }, NOTIFICATION_TIMEOUT);
  },
  clearNotification (state) {
    if (state.notificationTimeout) {
      clearTimeout(state.notificationTimeout);
      state.notificationTimeout = null;
    }

    state.snackbar = {
      isVisible: false,
      message: '',
      color: '',
    };
  },
};

export const actions = {
  async getMeetingTimes ({ commit }) {
    const meetingTimes = await this.$axios.$get('/api/meeting-times');
    commit('setMeetingTimes', meetingTimes);
  },
  async createMeetingTime ({ dispatch, commit }, meetingTime) {
    try {
      await this.$axios.$post('/api/meeting-times', meetingTime);
      commit('clearErrorState');
      dispatch('getMeetingTimes');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async editMeetingTime ({ dispatch, commit }, meetingTime) {
    try {
      await this.$axios.$put(`/api/meeting-times/${meetingTime.id}`, meetingTime);
      commit('clearErrorState');
      dispatch('getMeetingTimes');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async deleteMeetingTime ({ dispatch, commit }, meetingTimeId) {
    try {
      await this.$axios.$delete(`/api/meeting-times/${meetingTimeId}`);
      commit('clearNotification');
      dispatch('getMeetingTimes');
    } catch (error) {
      commit('setNotification', { color: 'error', message: 'Smazat projekt se nezdařilo.' });
    }
  },
  async getProjects ({ commit }) {
    const res = await this.$axios.$get('/api/projects',
      getProjectParams(),
    );

    commit('setProjects', res);
  },
  async createProject ({ dispatch, commit }, project) {
    try {
      await this.$axios.$post('/api/projects', project);
      dispatch('getAllProjects');
      commit('clearErrorState');
    } catch (error) {
      commit('setErrorState', error.response.data);
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async editProject ({ dispatch, commit }, project) {
    try {
      await this.$axios.$put(`/api/projects/${project.id}`, project);
      dispatch('getAllProjects');
      commit('clearErrorState');
    } catch (error) {
      commit('setErrorState', error.response.data);
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async addTeamLeader ({ dispatch, commit }, teamLeader) {
    try {
      await this.$axios.$put('/api/projects/teamLeader', teamLeader);
      dispatch('getAllProjects');
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async deleteProject ({ dispatch, commit }, projectId) {
    try {
      await this.$axios.$delete(`/api/projects/${projectId}`);
      dispatch('getAllProjects');
      commit('clearNotification');
    } catch (error) {
      commit('setNotification', { color: 'error', message: 'Smazat projekt se nezdařilo.' });
    }
  },
  async getAllProjects ({ commit }) {
    const res = await this.$axios.$get('/api/projects');

    commit('setAllProjects', res);
  },
  async editRating ({ commit }, ratingData) {
    await this.$axios.$post('/api/projectRatings', ratingData);
    commit('updateRating', ratingData);
  },
  async createStandup ({ dispatch, commit }, standup) {
    try {
      await this.$axios.$post('/api/standups', standup);
      dispatch('getProjectRating', standup.selectedDate);
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async deleteStandup ({ dispatch, commit }, standup) {
    try {
      await this.$axios.$delete(`/api/standups/${standup.id}`);
      dispatch('getProjectRating', standup.selectedDate);
      commit('clearNotification');
    } catch (error) {
      commit('setNotification', { color: 'error', message: 'Smazat standup se nezdařilo.' });
    }
  },
  async editStandup ({ dispatch, commit }, standup) {
    try {
      await this.$axios.$put(`/api/standups/${standup.id}`, standup);
      dispatch('getProjectRating', standup.selectedDate);
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async getProjectRating ({ commit }, date) {
    try {
      const res = await this.$axios.$get('/api/projectRatings', getDateParams(date));
      commit('setProjectRatings', res);
      commit('clearNotification');
    } catch (error) {
      commit('setNotification', { color: 'error', message: 'Získat hodnocení projektu se nezdařilo.' });
    }
  },
  async getProjectsForMonth ({ commit }, date) {
    const dateParams = getDateParams(date);
    const [projectData, ratingsData] = await Promise.all([
      this.$axios.$get('/api/projects'),
      this.$axios.$get('/api/projectRatings', dateParams),
    ]);

    const projects = filterProjectsByRatings(projectData, ratingsData, date);
    commit('setProjects', projects);
    commit('setProjectRatings', ratingsData);
  },
  async getStandupData ({ commit }) {
    const [projectData, ratingsData] = await Promise.all([
      this.$axios.$get('/api/projects', getProjectParams()),
      this.$axios.$get('/api/projectRatings', getDateParams()),
    ]);
    commit('setProjects', projectData);
    commit('setProjectRatings', ratingsData);
  },
  async getNotes ({ commit }) {
    const notes = await this.$axios.$get('/api/notes');
    commit('setNotes', notes);
  },
  async createNote ({ dispatch, commit }, note) {
    try {
      await this.$axios.$post('/api/notes', note);
      dispatch('getNotes');
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async editNote ({ dispatch, commit }, note) {
    try {
      await this.$axios.$put(`/api/notes/${note.id}`, note);
      dispatch('getNotes');
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async markNoteCompleted ({ dispatch, commit }, noteId) {
    try {
      await this.$axios.$post(`/api/notes/${noteId}/completed`);
      dispatch('getNotes');
      commit('clearNotification');
    } catch (error) {
      commit('setNotification', { color: 'error', message: `Označení poznámky za dokončenou se nezdařilo.` });
    }
  },
  async getProjectStatistics ({ commit }, params) {
    const projectStatistics = await this.$axios.$get(
      `/api/statistics/projects`,
      { params },
    );

    commit('setProjectStatistics', projectStatistics);
  },
  async getJiraData ({ commit }, params) {
    const syncDates = await this.$axios.$get(
      `/api/statistics/data`,
      { params: params.date },
    );

    const syncData = {
      status: params.status,
      startSyncTime: syncDates.startSyncTime,
      lastDuration: syncDates.lastDuration,
    };

    commit('setJiraSynchronizationStatus', syncData);
  },
  async addUserBonusXp ({ dispatch, commit }, params) {
    try {
      await this.$axios.$post('/api/statistics/bonus-xp', params);
      commit('setUserBonusXp', params);
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async getOfficeAbsences ({ commit }, params) {
    const payloads = {
      ...
      params,
      userId: this.$auth.user.id,
    };
    const officeAbsences = await this.$axios.$get(
      '/api/office-absences',
      { params: payloads },
      );

    commit('setOfficeAbsences', officeAbsences);
  },
  async getAbsenceTypeEnums ({ commit }) {
    const absenceTypeEnums = await this.$axios.$get('/api/office-absences/type-enums');

    commit('setAbsenceTypeEnums', absenceTypeEnums);
  },
  async getAbsenceStateEnums ({ commit }) {
    const absenceTypeEnums = await this.$axios.$get('/api/office-absences/state-enums');
    commit('setAbsenceStateEnums', absenceTypeEnums);
  },
  async getApprovers ({ commit }) {
    const params = {
      userId: this.$auth.user.id,
    };
    const approvers = await this.$axios.$get('/api/office-absences/approvers',
      { params },
    );
    commit('setApprovers', approvers);
  },
  async createOfficeAbsence ({ dispatch, commit }, officeAbsence) {
    try {
      await this.$axios.$post('/api/office-absence', officeAbsence);
      dispatch('getOfficeAbsences');
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data) {
        error.response.data.message = 'Nepřítomnost tohoto typu a v tomto intervalu již existuje.';
        commit('setErrorState', error.response.data);
      }
    }
  },
  async cancelOfficeAbsence ({ dispatch, commit }, officeAbsence) {
    try {
      await this.$axios.$post('/api/office-absences/cancel', officeAbsence);
      dispatch('getOfficeAbsences');
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async deleteOfficeAbsence ({ dispatch, commit }, absenceId) {
    try {
      await this.$axios.$delete(`/api/office-absences/${absenceId}`);
      dispatch('getOfficeAbsences');
      commit('clearNotification');
    } catch (error) {
      commit('setNotification', { color: 'error', message: `Nepřítomnost se nepodařilo odstranit.` });
    }
  },
  async getWorkLogs ({ commit }, params) {
    let payloads;
    if (params) {
      payloads = {
        authorId: params.authorId,
        costCategoryId: params.costCategoryId,
        startDate: params.dates[0],
        endDate: params.dates[1],
        loggedInUserId: this.$auth.user.id,
      };
    } else {
      payloads = {
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('month').format('YYYY-MM-DD'),
        loggedInUserId: this.$auth.user.id,
      };
    }
    const workLogs = await this.$axios.$get(
      '/api/work-logs',
      { params: payloads },
    );

    commit('setWorkLogs', workLogs);
  },
  async createWorkLog ({ dispatch, commit }, workLog) {
    try {
      await this.$axios.$post('/api/work-log', workLog);
      dispatch('getWorkLogs');
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data) {
        commit('setErrorState', error.response.data);
      }
    }
  },
  async deleteWorkLog ({ dispatch, commit }, workLogId) {
    try {
      await this.$axios.$delete(`/api/work-logs/${workLogId}`);
      dispatch('getWorkLogs');
      commit('clearNotification');
    } catch (error) {
      commit('setNotification', { color: 'error', message: `WorkLog se nepodařilo odstranit.` });
    }
  },
  async editWorkLog ({ dispatch, commit }, workLog) {
    try {
      await this.$axios.$put(`/api/work-log/${workLog.id}`, workLog);
      commit('clearErrorState');
      dispatch('getWorkLogs');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async getCostCategories ({ commit }) {
    const costCategories = await this.$axios({ url: '/api/cost-categories/tree', baseURL: process.env.NUXT_ENV_TF_ERP_API_URL, headers: {
        apitoken: process.env.NUXT_ENV_TF_ERP_API_TOKEN,
        Authorization: '',
      },
    });
    commit('setCostCategories', costCategories.data);
  },
  async getUsers ({ commit }) {
    const users = await this.$axios.$get('/api/users');

    commit('setUsers', users);
  },
  async createUser ({ dispatch, commit }, user) {
    try {
      await this.$axios.$post('/api/users', user);
      dispatch('getUsers');
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async editUser ({ dispatch, commit }, user) {
    try {
      await this.$axios.$put(`/api/users/${user.id}`, user);
      dispatch('getUsers');
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
  },
  async deleteUser ({ dispatch, commit }, userId) {
    try {
      await this.$axios.$delete(`/api/users/${userId}`);
      dispatch('getUsers');
      commit('clearNotification');
    } catch (error) {
      commit('setNotification', { color: 'error', message: `Uživatela se nepodařilo odstranit.` });
    }
  },
  async getRoles ({ commit }) {
    const roles = await this.$axios.$get('/api/roles');

    commit('setRoles', roles);
  },
  async getFeedbackData ({ commit }, date) {
    const [heatmap, feedbacks] = await Promise.all([
      this.$axios.$get(
        '/api/heatmap',
        getDateParams(date),
      ),
      this.$axios.$get(
        '/api/heatmap/feedbacks',
        getHeatmapParams(),
      ),
    ]);

    commit('setHeatmapWeeks', heatmap);
    commit('setUsersFeedbacks', feedbacks);
  },
};
