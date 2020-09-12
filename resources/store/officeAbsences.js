import moment from 'moment';

export const state = () => ({
  items: [],
  absenceTypeEnums: [],
  absenceStateEnums: [],
  approvers: [],
});

export const mutations = {
  setOfficeAbsences (state, officeAbsences) {
    state.items = officeAbsences.map(o => ({
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
      generalDescription: o.general_description,
      approverDescription: o.approver_description,
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
};

export const actions = {
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
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data) {
        error.response.data.message = 'Nepřítomnost tohoto typu a v tomto intervalu již existuje.';
        commit('errors/setErrorState', error.response.data, { root: true });
      }
    }
  },
  async cancelOfficeAbsence ({ dispatch, commit }, officeAbsence) {
    try {
      await this.$axios.$post('/api/office-absences/cancel', officeAbsence);
      dispatch('getOfficeAbsences');
      commit('errors/clearErrorState', null, { root: true });
    } catch (error) {
      if (error && error.response && error.response.data && error.response.data[0]) {
        commit('errors/setErrorState', error.response.data[0], { root: true });
      }
    }
  },
  async deleteOfficeAbsence ({ dispatch, commit }, absenceId) {
    try {
      await this.$axios.$delete(`/api/office-absences/${absenceId}`);
      dispatch('getOfficeAbsences');
      commit('notification/clearNotification', null, { root: true });
    } catch (error) {
      commit('notification/setNotification', { color: 'error', message: `Nepřítomnost se nepodařilo odstranit.` }, { root: true });
    }
  },
};
