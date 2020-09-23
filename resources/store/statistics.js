import { sortDesByProperty } from '../utils/sorts';

const calculateLevel = totalExp => {
  const d = -500 + Math.sqrt(500 * 500 + 4 * 5 * totalExp);
  const result = d / (2 * 5);

  return Math.floor(result);
};

const getBestUsersByMonthXp = array => {
  const numberOfBestUsers = 4;
  return array.slice(0, numberOfBestUsers);
};

const getBestUsersByTotalXp = array => {
  const numberOfBestUsers = 2;
  return array.slice(0, numberOfBestUsers);
};

export const state = () => ({
  items: [],
});

export const mutations = {
  setProjectStatistics(state, projectStatistics) {
    state.items = projectStatistics;
    const sortedUsersByMonthXp = projectStatistics.userStatistics.sort(sortDesByProperty.bind(this, 'monthXp'));
    state.items.heroesOfMonth = getBestUsersByMonthXp(sortedUsersByMonthXp);

    const sortedUsersByTotalXp = projectStatistics.userStatistics.sort(sortDesByProperty.bind(this, 'totalXp'));
    state.items.heroesOfGame = getBestUsersByTotalXp(sortedUsersByMonthXp);
  },
  setJiraSynchronizationStatus(state, syncData) {
    state.items.jiraSynchronization = {
      status: syncData.status,
      startSyncTime: syncData.startSyncTime,
      lastDuration: syncData.lastDuration,
    };
  },
  setUserBonusXp(state, userStatistic) {
    state.items.userStatistics.forEach((el, index) => {
      if (el.id === userStatistic.id) {
        state.items.userStatistics[index].bonusXp = userStatistic.bonusXp;
        state.items.userStatistics[index].totalXp = userStatistic.totalXp;
        state.items.userStatistics[index].newLevel = calculateLevel(userStatistic.totalXp);
        state.items.userStatistics[index].monthXp = userStatistic.monthXp;
      }
    });
    const sortedUsersByMonthXp = state.items.userStatistics.sort(sortDesByProperty.bind(this, 'monthXp'));
    state.items.heroesOfMonth = getBestUsersByMonthXp(sortedUsersByMonthXp);

    const sortedUsersByTotalXp = state.items.userStatistics.sort(sortDesByProperty.bind(this, 'totalXp'));
    state.items.heroesOfGame = getBestUsersByTotalXp(sortedUsersByMonthXp);
  },
};

export const actions = {
  async getProjectStatistics({ commit }, params) {
    const projectStatistics = await this.$axios.$get(`/api/statistics/projects`, { params });

    commit('setProjectStatistics', projectStatistics);
  },
  async getJiraData({ commit }, params) {
    const syncDates = await this.$axios.$get(`/api/statistics/data`, { params: params.date });

    const syncData = {
      status: params.status,
      startSyncTime: syncDates.startSyncTime,
      lastDuration: syncDates.lastDuration,
    };

    commit('setJiraSynchronizationStatus', syncData);
  },
  async addUserBonusXp({ dispatch, commit }, params) {
    try {
      await this.$axios.$post('/api/statistics/bonus-xp', params);
      commit('setUserBonusXp', params);
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
};
