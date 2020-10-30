<template>
  <v-layout column justify-center align-center>
    <v-flex>
      <div v-if="submitted" class="submit-feedback__message">
        <v-img
          v-if="approverDecisionId === '1'"
          class="thumb-up"
          src="/approved_absence.png"
          max-height="125"
          max-width="125"
        />
        <v-img v-else class="thumb-up" src="/reject_absence.png" max-height="125" max-width="125" />
        <h2>
          <strong>{{ title }}</strong>
        </h2>
      </div>
      <div v-if="error" class="redirect-message">
        <br />
        <br />
        {{ error }}
      </div>
    </v-flex>
  </v-layout>
</template>
<script>
const APPROVER_DECISION_ENUM = {
  APPROVED: '1',
  REJECTED: '2',
};

const ABSENCE_STATE_ENUM = {
  APPROVED: 1,
  REJECTED: 2,
  AWAITING_CANCELLATION_APPROVAL: 3,
  DONE: 4,
  CANCELED: 5,
  WAITING_FOR_APPROVAL: 6,
  REJECT_CANCELLATION: 7,
};

const handleFeedbackError = ({ response }) => {
  const errorName = response.data.name;
  const data = {
    loading: false,
    submitted: false,
    error: `Jejda! Něco se pokazilo.`,
  };
  switch (errorName) {
    case 'BAD_REQUEST':
      data.error = 'Token je povinný.';
      break;
    case 'TOKEN_NOT_FOUND':
      data.error = 'Token neexistuje nebo mu vypršela platnost.';
      break;
    case 'OFFICE_ABSENCE_NOT_FOUND':
      data.error = 'Žádost o nepřítomnost byla již pravděpodobně odstraněna.';
      break;
  }

  return data;
};

export default {
  validate({ store, route, redirect }) {
    const { token, approverDecisionId, officeAbsenceId } = route.query;
    if (!token || !approverDecisionId || !officeAbsenceId) {
      redirect('/');
      return false;
    }
    return true;
  },
  data() {
    return {
      loading: true,
      submitted: false,
      redirect: false,
      error: null,
      approverDecisionId: null,
      absenceState: null,
    };
  },
  computed: {
    title() {
      const approverDecision = this.approverDecisionId === APPROVER_DECISION_ENUM.APPROVED ? 'schválena' : 'zamítnuta';
      switch (this.absenceState.id) {
        case ABSENCE_STATE_ENUM.AWAITING_CANCELLATION_APPROVAL:
        case ABSENCE_STATE_ENUM.CANCELED:
        case ABSENCE_STATE_ENUM.REJECT_CANCELLATION:
          return `Žádost o zrušení nepřítomnosti byla ${approverDecision}`;
        case ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL:
        case ABSENCE_STATE_ENUM.REJECTED:
        case ABSENCE_STATE_ENUM.APPROVED:
          return `Žádost nepřítomnosti byla ${approverDecision}`;
        default:
          return `Žádost byla ${approverDecision}`;
      }
    },
  },
  async asyncData({ route, store, redirect, $axios }) {
    try {
      const absenceRequest = await $axios.get(`/api/office-absence/${route.query.officeAbsenceId}`);

      if (route.query.approverDecisionId === APPROVER_DECISION_ENUM.APPROVED) {
        await $axios.post('/api/office-absence/approve-absence-state', {
          token: route.query.token,
          officeAbsenceId: route.query.officeAbsenceId,
        });
      } else {
        await $axios.post('/api/office-absence/reject-absence-state', {
          token: route.query.token,
          officeAbsenceId: route.query.officeAbsenceId,
        });
      }
      return {
        loading: false,
        submitted: true,
        approverDecisionId: route.query.approverDecisionId,
        absenceState: absenceRequest.data.absenceStateEnum,
      };
    } catch (error) {
      return handleFeedbackError(error);
    }
  },
};
</script>

<style scoped>
.thumb-up {
  margin: 0 auto;
  margin-top: 100px;
}
.submit-feedback__message {
  text-align: center;
  font-size: 150%;
}

.redirect-message {
  margin-top: 5px;
  font-weight: bold;
  font-size: 1.3rem;
}
</style>
