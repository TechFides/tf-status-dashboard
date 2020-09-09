'use strict';
const { WebClient } = require('@slack/web-api');
const moment = require('moment');
const { SYSTEM_PARAMS } = require('../../constants');

const OfficeAbsenceModel = use('App/Models/OfficeAbsence');
const systemParamModel = use('App/Models/SystemParam');
const Env = use('Env');

class OfficeAbsenceMessanger {
  async sendError (error) {
    const slackWebClient = new WebClient(Env.get('SLACK_TOKEN'));
    const slackErrorName = (await systemParamModel
      .query()
      .where('key', '=', SYSTEM_PARAMS.SLACK_ERROR_CHANNEL)
      .first()).toJSON();

    const attachments = [
      {
        color: '#c62828',
        text: `Jeejda, něco se porouchalo :exclamation: \n Chyba: \*${error}\*.`,
      },
    ];

    await slackWebClient.chat.postMessage({ channel: slackErrorName.value, attachments: attachments });
    console.error(error);
  }

  static async getOfficeAbsence (officeAbsenceId) {
    return (await OfficeAbsenceModel
      .query()
      .with('user')
      .with('absenceApprover')
      .with('absenceTypeEnum')
      .where('id', officeAbsenceId)
      .first()).toJSON();
  }

  static async sendMessage (userEmail, privateMessageAttachments, absenceChannelMessageAttachments) {
    const slackWebClient = new WebClient(Env.get('SLACK_TOKEN'));
    const slackAbsenceChannelName = (await systemParamModel
      .query()
      .where('key', '=', SYSTEM_PARAMS.SLACK_ABSENCE_CHANNEL)
      .first()).toJSON();

    const userSlackId = await slackWebClient.users.lookupByEmail({email: userEmail});
    if (userSlackId) {
      const { channel } = await slackWebClient.conversations.open({ users: userSlackId.user.id });
      await slackWebClient.chat.postMessage({ channel: channel.id, attachments: privateMessageAttachments });
    }

    if (absenceChannelMessageAttachments && slackAbsenceChannelName.value) {
      await slackWebClient.chat.postMessage({ channel: slackAbsenceChannelName.value, attachments: absenceChannelMessageAttachments });
    }
  }

  static attachmentsFactory ({color, text, title, title_link}) {
    return [
      {
        color: color || '#4caf50',
        text: text || '',
        title: title || 'Dashboard nepřítomnosti',
        title_link: title_link || `${process.env.VUE_APP_URL}/office-absences`,
      },
    ];
  }

  static getDates (startOfficeAbsence, endOfficeAbsence) {
    const isSame = moment(startOfficeAbsence).isSame(endOfficeAbsence);

    return isSame ? moment(startOfficeAbsence).format('DD.MM.YYYY') : `od ${moment(startOfficeAbsence).format('DD.MM.YYYY')} do ${moment(endOfficeAbsence).format('DD.MM.YYYY')}`;
  }

  async sendApproveCreateAbsenceMessage (officeAbsenceId) {
    const officeAbsence = await OfficeAbsenceMessanger.getOfficeAbsence(officeAbsenceId);
    const privateMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      text: `Tvoje žádost o "${officeAbsence.absenceTypeEnum.value}" ${OfficeAbsenceMessanger.getDates(officeAbsence.absence_start, officeAbsence.absence_end)} byla schválena. Nastav si prosím automatickou odpověď na mailu v době nepřítomnosti, viz <https://docs.google.com/document/d/19NslMB1JBY6yvPimD-U34WNiFAS06D57A-SJM-w-dVM/edit#|Automatická odpověď v nepřítomnosti>`,
    });
    const absenceChannelMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      text: `${officeAbsence.user.first_name} ${officeAbsence.user.last_name} si bere "${officeAbsence.absenceTypeEnum.value}" ${OfficeAbsenceMessanger.getDates(officeAbsence.absence_start, officeAbsence.absence_end)}. Poznámka: ${officeAbsence.general_description}`,
    });

    try {
      await OfficeAbsenceMessanger.sendMessage(officeAbsence.user.email, privateMessageAttachments, absenceChannelMessageAttachments);
    } catch (error) {
      await OfficeAbsenceMessanger.sendError(error.data.error);
    }
  }

  async sendApproveCancelAbsenceMessage (officeAbsenceId) {
    const officeAbsence = await OfficeAbsenceMessanger.getOfficeAbsence(officeAbsenceId);
    const privateMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      text: `Tvoje nepřítomnost "${officeAbsence.absenceTypeEnum.value}" ${OfficeAbsenceMessanger.getDates(officeAbsence.absence_start, officeAbsence.absence_end)} byla zrušena.`,
    });
    const absenceChannelMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      text: `${officeAbsence.user.first_name} ${officeAbsence.user.last_name} si ruší "${officeAbsence.absenceTypeEnum.value}" ${OfficeAbsenceMessanger.getDates(officeAbsence.absence_start, officeAbsence.absence_end)}.`,
    });

    try {
      await OfficeAbsenceMessanger.sendMessage(officeAbsence.user.email, privateMessageAttachments, absenceChannelMessageAttachments);
    } catch (error) {
      await OfficeAbsenceMessanger.sendError(error.data.error);
    }
  }

  async sendRejectCreateAbsenceMessage (officeAbsenceId) {
    const officeAbsence = await OfficeAbsenceMessanger.getOfficeAbsence(officeAbsenceId);
    const privateMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      color: '#c62828',
      text: `Tvoje žádost o "${officeAbsence.absenceTypeEnum.value}" ${OfficeAbsenceMessanger.getDates(officeAbsence.absence_start, officeAbsence.absence_end)} byla bohužel zamítnuta. Pro bližší informace se poptej u ${officeAbsence.absenceApprover.first_name} ${officeAbsence.absenceApprover.last_name}`,
    });

    try {
      await OfficeAbsenceMessanger.sendMessage(officeAbsence.user.email, privateMessageAttachments);
    } catch (error) {
      await OfficeAbsenceMessanger.sendError(error.data.error);
    }
  }

  async sendRejectCancelAbsenceMessage (officeAbsenceId) {
    const officeAbsence = await OfficeAbsenceMessanger.getOfficeAbsence(officeAbsenceId);
    const privateMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      color: '#c62828',
      text: `Tvoje žádost o zrušení "${officeAbsence.absenceTypeEnum.value}" ${OfficeAbsenceMessanger.getDates(officeAbsence.absence_start, officeAbsence.absence_end)} byla bohužel zamítnuta. Pro bližší informace se poptej u ${officeAbsence.absenceApprover.first_name} ${officeAbsence.absenceApprover.last_name}`,
    });

    try {
      await OfficeAbsenceMessanger.sendMessage(officeAbsence.user.email, privateMessageAttachments);
    } catch (error) {
      await OfficeAbsenceMessanger.sendError(error.data.error);
    }
  }
}

module.exports = new OfficeAbsenceMessanger();
