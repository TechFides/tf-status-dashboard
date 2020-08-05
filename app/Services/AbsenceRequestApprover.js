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

const { ABSENCE_STATE_ENUM } = require('../../constants');

class AbsenceRequestApproverService {
  static getAbsenceRequestOptions (token, officeAbsenceId) {
    const absenceRequestOptions = [
      { text: 'Schválit', type: 'approved', id: ABSENCE_STATE_ENUM.APPROVED },
      { text: 'Zamítnout', type: 'reject', id: ABSENCE_STATE_ENUM.REJECTED },
    ];
    const vueAppUrl = Env.get('VUE_APP_URL');
    return absenceRequestOptions.map(option => ({
      ...option,
      absenceRequestUrl: `${vueAppUrl}/submit-office-absence?token=${token}&absenceRequestEnumId=${option.id}&officeAbsenceId=${officeAbsenceId}`,
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

      const waitingForApprovalText = 'Žádost o nepřítomnost v kanceláři.';
      const waitingCancellationApprovalText = 'Žádost o zrušení nepřítomnosti v kanceláři.';
      const commonEmailData = {
        text: officeAbsence.absenceStateEnum.id === ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL ? waitingForApprovalText : waitingCancellationApprovalText,
        subject: officeAbsence.absenceStateEnum.id === ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL ? waitingForApprovalText : waitingCancellationApprovalText,
      };

      const token = await AbsenceRequestTokenModel.create({
        user_id: officeAbsence.user.id,
        token: crypto.randomBytes(16).toString('hex'),
        expiration_date: moment().add(7, 'days').format('YYYY-MM-DD'),
      });

      EmailService.sendEmail({
        ...commonEmailData,
        toAddresses: [officeAbsence.absenceApprover.email],
        html: this.template({
          absenceType: officeAbsence.absenceTypeEnum,
          absenceRequestOptions: AbsenceRequestApproverService.getAbsenceRequestOptions(token.token, officeAbsenceId),
        }),
      });
    } catch (e) {
      Logger.debug(`something get wrong: ${e}`);
    }
  }
}

module.exports = new AbsenceRequestApproverService();
