import moment from 'moment';

export const state = () => ({
  items: [],
  timeSpentSum: '',
});

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

export const mutations = {
  setWorkLogs (state, workLogs) {
    state.items = workLogs.items.map(w => ({
      id: w.id,
      author: {
        fullName: w.user ? `${w.user .first_name} ${w.user .last_name}` : '',
        id: w.user ? w.user .id : null,
      },
      started: moment(w.started).format('DD.MM.YYYY'),
      startedByNumber: moment(w.started).valueOf(),
      timeSpent: getTimeSpent(w.time_spent),
      timeSpentByNumber: w.time_spent,
      description: w.description,
      costCategory: {
        id: w.costCategory.id,
        name: w.costCategory.name,
      },
    }));

    state.timeSpentSum = getTimeSpent(workLogs.timeSpentSum);
  },
};

export const actions = {
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
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data) {
        commit('errors/setErrorState', error.response.data, { root: true });
      }
    }
  },
  async deleteWorkLog ({ dispatch, commit }, workLogId) {
    try {
      await this.$axios.$delete(`/api/work-logs/${workLogId}`);
      dispatch('getWorkLogs');
      commit('notification/clearNotification', null, { root: true });
    } catch (error) {
      commit('notification/setNotification', { color: 'error', message: `WorkLog se nepodařilo odstranit.` }, { root: true });
    }
  },
  async editWorkLog ({ dispatch, commit }, workLog) {
    try {
      await this.$axios.$put(`/api/work-log/${workLog.id}`, workLog);
      commit('errors/clearErrorState', null, { root: true });
      dispatch('getWorkLogs');
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
};
