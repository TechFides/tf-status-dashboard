export const state = () => ({
  notes: [],
  projects: [],
  allProjects: [],
  projectStatistics: [],
  standups: [],
  standupRatings: {},
  users: [],
  roles: [],
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

const sortByProperty = function (property, a, b) {
  return a[property] > b[property] ? 1
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

const calculateLevel = (totalExp) => {
  const d = -500 + Math.sqrt(500 * 500 + 4 * 5 * totalExp);
  const result = d / (2 * 5);

  return Math.floor(result);
};

const filterProjectsByRatings = (projects, ratings) => {
  const allowedProjectIds = {};
  for (const { standupProjectRating } of ratings) {
    for (const { project_id } of standupProjectRating) {
      allowedProjectIds[project_id] = true;
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
    state.projects = projects.map(p => ({
      id: p.id,
      code: p.code,
      description: p.description,
      isActive: p.is_active === 1,
    })).sort(sortByProperty.bind(this, 'code'));
  },
  setAllProjects (state, projects) {
    state.allProjects = projects.map(p => ({
      id: p.id,
      code: p.code,
      description: p.description,
      isActive: p.is_active === 1,
    })).sort(sortByProperty.bind(this, 'code'));
  },
  setProjectRatings (state, standupRatings) {
    const newStandupRatings = standupRatings.sort(sortByProperty.bind(this, 'date'));
    for (const [index, { standupProjectRating }] of newStandupRatings.entries()) {
      const newRatings = {};
      for (const { project_id, standup_project_rating_enum_id } of standupProjectRating) {
        // eslint-disable-next-line camelcase
        newRatings[project_id] = standup_project_rating_enum_id;
      }

      newStandupRatings[index].standupProjectRating = newRatings;
    }

    state.standupRatings = newStandupRatings;
  },
  setProjectStatistics (state, projectStatistics) {
    state.projectStatistics = projectStatistics;
  },
  setNotes (state, notes) {
    state.notes = notes.map(n => ({
      id: n.id,
      projectId: n.project.id,
      projectCode: n.project.code,
      deadlineDate: n.deadline,
      created: n.created_at,
      text: n.note,
    })).sort(sortByProperty.bind(this, 'projectCode'));
  },
  setUsers (state, users) {
    state.users = users.map(u => ({
      firstName: u.first_name,
      id: u.id,
      isActive: u.is_active,
      lastName: u.last_name,
      level: calculateLevel(u.total_exp),
      totalExp: u.total_exp,
      username: u.username,
      roles: u.roles.map(r => r.slug),
    }));
  },
  setRoles (state, roles) {
    state.roles = roles;
  },
  setMeetingTimes (state, meetingTimes) {
    state.meetingTimes = meetingTimes.map(
      meetingTime => Object.assign({}, meetingTime, {
        projects: meetingTime.projects.map(({code}) => code).join(', '),
      })
    );
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
    }, 4000);
  },
  clearNotification (state) {
    clearTimeout(state.notificationTimeout);
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
  async createMeetingTime ({ dispatch }, meetingTime) {
    await this.$axios.$post('/api/meeting-times', meetingTime);
    dispatch('getMeetingTimes');
  },
  async editMeetingTime ({ dispatch }, meetingTime) {
    await this.$axios.$put(`/api/meeting-times/${meetingTime.id}`, meetingTime);
    dispatch('getMeetingTimes');
  },
  async deleteMeetingTime ({ dispatch }, meetingTimeId) {
    await this.$axios.$delete(`/api/users/${meetingTimeId}`);
    dispatch('getMeetingTimes');
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
      commit('setNotification', {color: 'error', message: 'Smazat projekt se nezdařilo.'});
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
      commit('setNotification', {color: 'error', message: 'Smazat standup se nezdařilo.'});
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
      const res = await this.$axios.$get(
        '/api/projectRatings',
        getDateParams(date),
      );
      commit('setProjectRatings', res);
      commit('clearNotification');
    } catch (error) {
      commit('setNotification', {color: 'error', message: 'Získat hodnotení projektu se nezdařilo.'});
    }
  },
  async getProjectsForMonth ({ commit }, date) {
    const dateParams = getDateParams(date);
    const [projectData, ratingsData] = await Promise.all([
      this.$axios.$get(
        '/api/projects',
      ),
      this.$axios.$get(
        '/api/projectRatings',
        dateParams,
      ),
    ]);

    const projects = filterProjectsByRatings(projectData, ratingsData);

    commit('setProjects', projects);
    commit('setProjectRatings', ratingsData);
  },
  async getStandupData ({ commit }) {
    const [projectData, ratingsData] = await Promise.all([
      this.$axios.$get(
        '/api/projects',
        getProjectParams(),
      ),
      this.$axios.$get(
        '/api/projectRatings',
        getDateParams(),
      ),
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
      commit('setNotification', {color: 'error', message: `Označení poznámky za dokončenou se nezdařilo.`});
    }

    commit('setNotification', {color: 'error', message: `Označení poznámky za dokončenou se nezdařilo.`});
  },
  async getProjectStatistics ({ commit }, params) {
    const projectStatistics = await this.$axios.$get(
      `/api/statistics/projects`,
      { params },
    );

    commit('setProjectStatistics', projectStatistics);
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
      commit('setNotification', {color: 'error', message: `Uživatela se nepodařilo odstranit.`});
    }
  },
  async getRoles ({ commit }) {
    const roles = await this.$axios.$get('/api/roles');

    commit('setRoles', roles);
  },
};
