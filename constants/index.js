module.exports = {
  AVERAGE_MONTH_WORKED_HOURS: 168,

  SYSTEM_PARAMS: {
    FEEDBACK_CRONTAB: 'feedbackCrontab',
    SLACK_ERROR_CHANNEL: 'slackErrorChannel',
    SLACK_SITDOWN_CHANNEL: 'slackSchedulerChannel',
    SLACK_ABSENCE_CHANNEL: 'slackAbsenceChannel',
    ABSENCE_APPROVER: 'absenceApprover',
  },

  EXP_MODIFIER: {
    TEAM_LEADER: {
     value: null,
     name: 'teamLeader',
    },
    SOLO_PLAYER: {
      value: 1.5,
      name: 'soloPlayer',
    },
    WITHOUT_LEADER: {
      value: 1,
      name: 'withoutLeader',
    },
    OTHER_LEADER: {
      value: 1,
      name: 'otherLeader',
    },
  },

  RATING_ENUM: {
    HIATUS: 0,
    FAIL: 1,
    STANDARD: 6,
    GOOD: 7,
    AMAZING: 5,
  },
};
