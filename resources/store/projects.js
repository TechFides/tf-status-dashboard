import { getActiveParams } from '../utils/getParams';
import { sortAscByProperty } from '../utils/sorts';

const findAndFormatMeetingTimeTextForSelect = (meetingTimes, meetingTimeId) => {
  const selectedMeetingTime = meetingTimes.find(meetingTime => meetingTime.id === meetingTimeId);

  return selectedMeetingTime ? selectedMeetingTime.dayAndTime : '';
};

export const state = () => ({
  items: [],
  all: [],
});

export const mutations = {
  async setProjects (state, data) {
    state.items = data.projects.map(p => {
      const meetingTime = data.meetingTimes.find(meetingTime => meetingTime.id === p.meeting_time_id);

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
  async setAllProjects (state, data) {
    state.all = data.projects.map(p => ({
      id: p.id,
      code: p.code,
      description: p.description,
      isActive: p.is_active === 1,
      slackChannelName: p.slackChannel ? p.slackChannel.channel_name : '',
      teamLeader: {
        id: p.projectUser && p.projectUser.user ? p.projectUser.user.id : null,
        name: p.projectUser && p.projectUser.user ? `${p.projectUser.user.first_name} ${p.projectUser.user.last_name}` : '',
      },
      meetingTime: {
        text: findAndFormatMeetingTimeTextForSelect(data.meetingTimes, p.meeting_time_id),
        value: p.meeting_time_id,
      },
    })).sort(sortAscByProperty.bind(this, 'code'));
  },
};

export const actions = {
  async getProjects ({ commit, rootState }) {
    const meetingTimes = rootState.meetingTimes.items;
    const projects = await this.$axios.$get('/api/projects',
      getActiveParams(),
    );

    commit('setProjects', {projects, meetingTimes});
  },
  async getAllProjects ({ commit, rootState}) {
    const meetingTimes = rootState.meetingTimes.items;
    const projects = await this.$axios.$get('/api/projects');

    commit('setAllProjects', {projects, meetingTimes});
  },
  async createProject ({ dispatch, commit }, project) {
    try {
      await this.$axios.$post('/api/projects', project);
      dispatch('getAllProjects');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      commit('errors/setErrorState', error.response.data, { root: true });
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async editProject ({ dispatch, commit }, project) {
    try {
      await this.$axios.$put(`/api/projects/${project.id}`, project);
      dispatch('getAllProjects');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      commit('errors/setErrorState', error.response.data, { root: true });
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async deleteProject ({ dispatch, commit }, projectId) {
    try {
      await this.$axios.$delete(`/api/projects/${projectId}`);
      dispatch('getAllProjects');
      commit('notification/clearNotification', null, { root: true });
    } catch (error) {
      commit('notification/setNotification', { color: 'error', message: 'Smazat projekt se nezdařilo.' }, { root: true });
    }
  },
  async addTeamLeader ({ dispatch, commit }, teamLeader) {
    try {
      await this.$axios.$put('/api/projects/teamLeader', teamLeader);
      dispatch('getAllProjects');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
};
