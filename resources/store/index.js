import { WEEK_DAYS, WEEK_DAYS_SHORTHAND } from '../constants';

const NOTIFICATION_TIMEOUT = 4000;

export const state = () => ({
  notes: [],
  projects: [],
  allProjects: [],
  projectStatistics: [],
  standups: [],
  standupRatings: {},
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

const filterProjectsByRatings = (projects, ratings) => {
  const allowedProjectIds = {};
  for (const { standupProjectRating } of ratings) {
    for (const { project_id: projectId } of standupProjectRating) {
      allowedProjectIds[projectId] = true;
    }
  }

  return projects.filter(p => allowedProjectIds[p.id]);
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
    state.projectStatistics.heroesOfMonth = [sortedUsersByMonthXp[0], sortedUsersByMonthXp[1], sortedUsersByMonthXp[2]];

    const sortedUsersByTotalXp = projectStatistics.userStatistics.sort(sortDesByProperty.bind(this, 'totalXp'));
    state.projectStatistics.heroesOfGame = [sortedUsersByTotalXp[0], sortedUsersByTotalXp[1], sortedUsersByTotalXp[2]];
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
  setUsers (state, users) {
    state.users = users.map(u => ({
      firstName: u.first_name,
      id: u.id,
      isActive: u.is_active,
      sendFeedback: u.send_feedback,
      lastName: u.last_name,
      username: u.username,
      email: u.email,
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

    const projects = filterProjectsByRatings(projectData, ratingsData);

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
  async getJiraData ({ commit }, params) {;
    const projectStatistics = await this.$axios.$get(
      `/api/statistics/data`,
      { params },
    );
    commit('setProjectStatistics', projectStatistics);
  },
  async addUserBonusXp ({ dispatch, commit }, params) {
    try {
      await this.$axios.$post('/api/statistics/user/', params);
      commit('setUserBonusXp', params);
      commit('clearErrorState');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('setErrorState', error.response.data[0]);
      }
    }
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
