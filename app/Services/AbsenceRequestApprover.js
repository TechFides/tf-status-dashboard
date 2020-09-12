'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment');
const Handlebars = require('handlebars');
const Logger = use('Logger');

const Env = use('Env');
const EmailService = use('App/Services/Email');
const OfficeAbsenceModel = use('App/Models/OfficeAbsence');
const AbsenceRequestTokenModel = use('App/Models/AbsenceRequestToken');

const { ABSENCE_STATE_ENUM, APPROVER_DECISION_ENUM } = require('../../constants');

class AbsenceRequestApproverService {
  static getApproverDecisionOptions (token, officeAbsenceId) {
    const approverDecisionOptions = [
      { text: 'Schválit', type: 'approved', id: APPROVER_DECISION_ENUM.APPROVED },
      { text: 'Zamítnout', type: 'reject', id: APPROVER_DECISION_ENUM.REJECTED },
    ];
    const vueAppUrl = Env.get('VUE_APP_URL');
    return approverDecisionOptions.map(option => ({
      ...option,
      absenceRequestUrl: `${vueAppUrl}/submit-office-absence?token=${token}&approverDecisionId=${option.id}&officeAbsenceId=${officeAbsenceId}`,
    }));
  }

  static loadEmailTemplate () {
    const html = fs.readFileSync(path.resolve(__dirname, '../../assets/email-templates/absenceAprrover.html'), 'utf-8');
    return Handlebars.compile(html);
  }

  constructor () {
    this.template = AbsenceRequestApproverService.loadEmailTemplate();
  }

  async requestAbsence (officeAbsenceId) {
    try {
      const officeAbsence = (await OfficeAbsenceModel
        .query()
        .with('user')
        .with('absenceApprover')
        .with('absenceTypeEnum')
        .with('absenceStateEnum')
        .where('id', officeAbsenceId)
        .first()).toJSON();

      const waitingForApprovalSubject = `Žádost:  ${officeAbsence.user.first_name.charAt(0)}. ${officeAbsence.user.last_name} ${officeAbsence.absenceTypeEnum.short_cut} (${officeAbsence.absence_hours_number}h) ${officeAbsence.general_description}`;
      const waitingCancellationApprovalSubject = `Žádost:  ${officeAbsence.user.first_name.charAt(0)}. ${officeAbsence.user.last_name} ${officeAbsence.absenceTypeEnum.short_cut} (${officeAbsence.absence_hours_number}h) ${officeAbsence.general_description}`;
      const commonEmailData = {
        text: officeAbsence.absenceStateEnum.id === ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL ? waitingForApprovalSubject : waitingCancellationApprovalSubject,
        subject: officeAbsence.absenceStateEnum.id === ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL ? waitingForApprovalSubject : waitingCancellationApprovalSubject,
      };

      const token = await AbsenceRequestTokenModel.create({
        user_id: officeAbsence.user.id,
        token: crypto.randomBytes(16).toString('hex'),
        expiration_date: moment().add(7, 'days').format('YYYY-MM-DD'),
      });

      const waitingForApprovalText = `${officeAbsence.user.first_name} ${officeAbsence.user.last_name} žádá o nepřítomnost v kanceláři, chcete ji schválit?`;
      const waitingCancellationApprovalText = `${officeAbsence.user.first_name} ${officeAbsence.user.last_name} žádá o zrušení nepřítomnosti v kanceláři,  chcete tyto změny schválit?`;

      EmailService.sendEmail({
        ...commonEmailData,
        toAddresses: [officeAbsence.absenceApprover.email],
        html: this.template({
          absenceType: officeAbsence.absenceTypeEnum,
          approverDecisionOptions: AbsenceRequestApproverService.getApproverDecisionOptions(token.token, officeAbsenceId),
          absenceText: officeAbsence.absenceStateEnum.id === ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL ? waitingForApprovalText : waitingCancellationApprovalText,
          absenceProps: {
            startDate: moment(officeAbsence.absence_start).format('DD.MM.YYYY'),
            endDate: moment(officeAbsence.absence_end).format('DD.MM.YYYY'),
            type: officeAbsence.absenceTypeEnum.value,
            hoursNumber: officeAbsence.absence_hours_number,
            generalDescription: officeAbsence.general_description,
            approverDescription: officeAbsence.approver_description,
          },
        }),
      });
    } catch (e) {
      Logger.debug(`something get wrong: ${e}`);
    }
  }
}

module.exports = new AbsenceRequestApproverService();
