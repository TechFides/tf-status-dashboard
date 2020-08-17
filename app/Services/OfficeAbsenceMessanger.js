'use strict';
const { WebClient } = require('@slack/web-api');
const moment = require('moment');
const { SYSTEM_PARAMS } = require('../../constants');

const OfficeAbsenceModel = use('App/Models/OfficeAbsence');
const systemParamModel = use('App/Models/SystemParam');
const Env = use('Env');

class OfficeAbsenceMessanger {
  static async sendError (error) {
    const slackWebClient = new WebClient(Env.get('SLACK_TOKEN'));
    const slackErrorName = (await systemParamModel
      .query()
      .where('key', '=', SYSTEM_PARAMS.SLACK_ERROR_CHANNEL)
      .first()).toJSON();

    const attachments = [
      {
        color: '#c62828',
        text: `Jeejda, něco se porouchalo :exclamation: \n Chyba: \*${error.data.error}\*.`,
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
        title_link: title_link || `${process.env.VUE_APP_URL}/officeAbsences`,
      },
    ];
  }

  async sendApproveCreateAbsenceMessage (officeAbsenceId) {
    const officeAbsence = await OfficeAbsenceMessanger.getOfficeAbsence(officeAbsenceId);
    const privateMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      text: `Tvoje žádost o "${officeAbsence.absenceTypeEnum.value}" od ${moment(officeAbsence.absence_start).format('DD.MM.YYYY')} do ${moment(officeAbsence.absence_end).format('DD.MM.YYYY')} byla schválena.`,
    });
    const absenceChannelMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      text: `${officeAbsence.user.first_name} ${officeAbsence.user.last_name} si bere "${officeAbsence.absenceTypeEnum.value}" od ${moment(officeAbsence.absence_start).format('DD.MM.YYYY')} do ${moment(officeAbsence.absence_end).format('DD.MM.YYYY')}.`,
    });

    try {
      await OfficeAbsenceMessanger.sendMessage(officeAbsence.user.email, privateMessageAttachments, absenceChannelMessageAttachments);
    } catch (error) {
      await OfficeAbsenceMessanger.sendError(error);
    }
  }

  async sendApproveCancelAbsenceMessage (officeAbsenceId) {
    const officeAbsence = await OfficeAbsenceMessanger.getOfficeAbsence(officeAbsenceId);
    const privateMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      text: `Tvoje napřítomnost "${officeAbsence.absenceTypeEnum.value}" od ${moment(officeAbsence.absence_start).format('DD.MM.YYYY')} do ${moment(officeAbsence.absence_end).format('DD.MM.YYYY')} byla zrušena.`,
    });
    const absenceChannelMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      text: `${officeAbsence.user.first_name} ${officeAbsence.user.last_name} si ruší "${officeAbsence.absenceTypeEnum.value}" od ${moment(officeAbsence.absence_start).format('DD.MM.YYYY')} do ${moment(officeAbsence.absence_end).format('DD.MM.YYYY')}.`,
    });

    try {
      await OfficeAbsenceMessanger.sendMessage(officeAbsence.user.email, privateMessageAttachments, absenceChannelMessageAttachments);
    } catch (error) {
      await OfficeAbsenceMessanger.sendError(error);
    }
  }

  async sendRejectCreateAbsenceMessage (officeAbsenceId) {
    const officeAbsence = await OfficeAbsenceMessanger.getOfficeAbsence(officeAbsenceId);
    const privateMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      color: '#c62828',
      text: `Tvoje žádost o "${officeAbsence.absenceTypeEnum.value}" od ${moment(officeAbsence.absence_start).format('DD.MM.YYYY')} do ${moment(officeAbsence.absence_end).format('DD.MM.YYYY')} byla bohužel zamítnuta. Pro bližší informace se poptej u ${officeAbsence.absenceApprover.first_name} ${officeAbsence.absenceApprover.last_name}`,
    });

    try {
      await OfficeAbsenceMessanger.sendMessage(officeAbsence.user.email, privateMessageAttachments);
    } catch (error) {
      await OfficeAbsenceMessanger.sendError(error);
    }
  }

  async sendRejectCancelAbsenceMessage (officeAbsenceId) {
    const officeAbsence = await OfficeAbsenceMessanger.getOfficeAbsence(officeAbsenceId);
    const privateMessageAttachments = OfficeAbsenceMessanger.attachmentsFactory({
      color: '#c62828',
      text: `Tvoje žádost o zrušení "${officeAbsence.absenceTypeEnum.value}" od ${moment(officeAbsence.absence_start).format('DD.MM.YYYY')} do ${moment(officeAbsence.absence_end).format('DD.MM.YYYY')} byla bohužel zamítnuta. Pro bližší informace se poptej u ${officeAbsence.absenceApprover.first_name} ${officeAbsence.absenceApprover.last_name}`,
    });

    try {
      await OfficeAbsenceMessanger.sendMessage(officeAbsence.user.email, privateMessageAttachments);
    } catch (error) {
      await OfficeAbsenceMessanger.sendError(error);
    }
  }
}

module.exports = new OfficeAbsenceMessanger();
