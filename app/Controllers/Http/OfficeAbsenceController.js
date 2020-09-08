'use strict';

const moment = require('moment');

const OfficeAbsenceModel = use('App/Models/OfficeAbsence');
const AbsenceTypeEnumModel = use('App/Models/AbsenceTypeEnum');
const AbsenceStateEnumModel = use('App/Models/AbsenceStateEnum');
const SystemParamModel = use('App/Models/SystemParam');
const UserModel = use('App/Models/User');
const AbsenceApproverModel = use('App/Models/AbsenceApprover');
const AbsenceRequestApproverService = use('App/Services/AbsenceRequestApprover');
const AbsenceRequestTokenModel = use('App/Models/AbsenceRequestToken');
const OfficeAbsenceMessanger = use('App/Services/OfficeAbsenceMessanger');
const GoogleCalendarManager = use('App/Services/GoogleCalendarManager/GoogleCalendarManager');

const { ABSENCE_STATE_ENUM, SYSTEM_PARAMS } = require('../../../constants');

class OfficeAbsenceController {
  static mapToDbEntity (request) {
    const {
      userId,
      absenceStart,
      absenceEnd,
      absenceType,
      approver,
      absenceHoursNumber,
      generalDescription,
      approverDescription,
    } = request.only(['userId', 'absenceStart', 'absenceEnd', 'absenceType', 'approver', 'absenceHoursNumber', 'description', 'generalDescription', 'approverDescription']);

    return {
      user_id: userId,
      absence_start: absenceStart,
      absence_end: absenceEnd,
      absence_type_enum_id: absenceType,
      absence_state_enum_id: ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL,
      absence_approver_id: approver,
      absence_hours_number: absenceHoursNumber,
      updated_at: moment().format('YYYY-MM-DD'),
      general_description: generalDescription,
      approver_description: approverDescription,
    };
  }

  static async setOfficeAbsenceState (officeAbsenceId, stateId) {
    const officeAbsence = await OfficeAbsenceModel.find(officeAbsenceId);

    officeAbsence.absence_state_enum_id = stateId;
    await officeAbsence.save();
  }

  async getOfficeAbsenceList ({ request, response, params }) {
    let { absenceType, absenceState, userId } = request.get();
    const officeAbsenceQuery = OfficeAbsenceModel
      .query()
      .with('user')
      .with('absenceApprover')
      .with('absenceTypeEnum')
      .with('absenceStateEnum')
      .where('user_id', userId);

    if (absenceType) {
      officeAbsenceQuery.where('absence_type_enum_id', absenceType);
    }

    if (absenceState) {
      officeAbsenceQuery.where('absence_state_enum_id', absenceState);
    }

    const officeAbsenceList = (await officeAbsenceQuery.fetch()).toJSON();

    for (const officeAbsence of officeAbsenceList) {
      if (moment().isAfter(moment(officeAbsence.absence_end).add(1, 'day')) && officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.APPROVED) {
        officeAbsence.absenceStateEnum = await AbsenceStateEnumModel.find(ABSENCE_STATE_ENUM.DONE);
        await OfficeAbsenceController.setOfficeAbsenceState(officeAbsence.id, ABSENCE_STATE_ENUM.DONE);
      }
    }

    return officeAbsenceList;
  }

  async getOfficeAbsence ({ request, response, params }) {
    const { id } = params;
    const officeAbsence = (await OfficeAbsenceModel
      .query()
      .with('user')
      .with('absenceApprover')
      .with('absenceTypeEnum')
      .with('absenceStateEnum')
      .where('id', id)
      .first()).toJSON();

    return officeAbsence;
  }

  async getOfficeAbsenceChanges ({ request, response, params }) {
    const {
      date,
    } = request.only(['date']);
    const officeAbsence = (await OfficeAbsenceModel
      .query()
      .where('updated_at', '>=', date)
      .select('id', 'created_at', 'updated_at')
      .fetch()).toJSON();

    return officeAbsence;
  }

  async getAbsenceTypeEnums ({ request, response, params }) {
    const absenceTypeEnumModel = await AbsenceTypeEnumModel
      .query()
      .orderBy('value', 'asc')
      .fetch();

    return absenceTypeEnumModel.toJSON();
  }

  async getAbsenceStateEnums ({ request, response, params }) {
    const absenceStateEnumModel = await AbsenceStateEnumModel
      .query()
      .orderBy('value', 'asc')
      .fetch();

    return absenceStateEnumModel.toJSON();
  }

  async getApprovers ({ request, response, params }) {
    const { userId } = request.get();
    const absenceApproverList = [];

    const userApprovers = (await AbsenceApproverModel
      .query()
      .where('user_id', userId)
      .with('approver')
      .fetch()).toJSON();
    if (userApprovers.length) {
      for (const userApprover of userApprovers) {
        userApprover.approver.priority = true;
        absenceApproverList.push(userApprover.approver);
      }
    }

    const absenceApprover = await SystemParamModel.findBy('key', SYSTEM_PARAMS.ABSENCE_APPROVER_ID);
    if (absenceApprover) {
      const defaultApprover = (await UserModel.find(absenceApprover.value)).toJSON();
      const foundedDefaultApprover = absenceApproverList.find(approver => approver.id === defaultApprover.id);

      if (!foundedDefaultApprover) {
        defaultApprover.priority = false;
        absenceApproverList.push(defaultApprover);
      }
    }

    return absenceApproverList;
  }

  async createOfficeAbsence ({ request, response, params }) {
    const {
      absenceStart,
      absenceEnd,
      absenceType,
      userId,
    } = request.only(['absenceStart', 'absenceEnd', 'absenceType', 'userId']);
    const officeAbsenceData = OfficeAbsenceController.mapToDbEntity(request);
    const absenceTypeEnumModel = (await AbsenceTypeEnumModel.find(officeAbsenceData.absence_type_enum_id)).toJSON();
    const author = (await UserModel.find(officeAbsenceData.user_id)).toJSON();
    const foundedOfficeAbsence = await OfficeAbsenceModel
      .query()
      .where('absence_type_enum_id', absenceType)
      .where('user_id', userId)
      .whereNot('absence_state_enum_id', ABSENCE_STATE_ENUM.CANCELED)
      .whereNot('absence_state_enum_id', ABSENCE_STATE_ENUM.REJECTED)
      .whereBetween('absence_start',[absenceStart,absenceEnd])
      .orWhereBetween('absence_end',[absenceStart,absenceEnd])
      .andWhere('absence_type_enum_id', absenceType)
      .andWhere('user_id', userId)
      .andWhereNot('absence_state_enum_id', ABSENCE_STATE_ENUM.CANCELED)
      .andWhereNot('absence_state_enum_id', ABSENCE_STATE_ENUM.REJECTED)
      .first();

    if (foundedOfficeAbsence) {
      return response.status(400).send({ name: 'BAD_REQUEST', message: 'Office absence in this date range and absence type already exists' });
    }

    officeAbsenceData.calendar_event_title = `${author.first_name} ${author.last_name.charAt(0)}. ${absenceTypeEnumModel.short_cut} (${officeAbsenceData.absence_hours_number}h) ${officeAbsenceData.general_description}`;

    const officeAbsence = (await OfficeAbsenceModel.create(officeAbsenceData)).toJSON();

    AbsenceRequestApproverService.requestAbsence(officeAbsence.id);
    return officeAbsence;
  }

  async cancelOfficeAbsence ({ request, response, params }) {
    const {
      approverId,
      absenceId,
    } = request.only(['approverId', 'absenceId']);
    const officeAbsence = await OfficeAbsenceModel.find(absenceId);
    officeAbsence.absence_approver_id = approverId;
    officeAbsence.absence_state_enum_id = ABSENCE_STATE_ENUM.AWAITING_CANCELLATION_APPROVAL;

    await officeAbsence.save();
    AbsenceRequestApproverService.requestAbsence(officeAbsence.id);

    return officeAbsence.toJSON();
  }

  async deleteOfficeAbsence ({ request, response, params }) {
    const { id } = params;
    const officeAbsence = await OfficeAbsenceModel.find(id);

    try {
      await officeAbsence.delete();
      response.send();
    } catch (e) {
      response.status(500).send({message: e.message});
    }
  }

  async approveAbsenceState ({ request, response, params }) {
    const {
      token,
      officeAbsenceId,
    } = request.only(['token', 'officeAbsenceId']);
    if (!token) {
      return response.status(400).send({ name: 'BAD_REQUEST', message: 'Token is required' });
    }

    const absenceToken = AbsenceRequestTokenModel.findBy('token', token);
    if (!absenceToken && moment().isAfter(moment(absenceToken.expiration_date))) {
      return response.status(404).send({ name: 'TOKEN_NOT_FOUND', message: 'Token is invalid or token is expired' });
    }

    const officeAbsence = await OfficeAbsenceModel.find(officeAbsenceId);
    if (!officeAbsence) {
      return response.status(404).send({ name: 'OFFICE_ABSENCE_NOT_FOUND', message: 'Office absence does not exists' });
    }

    if (officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL
      || officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.REJECTED) {
      officeAbsence.absence_state_enum_id = ABSENCE_STATE_ENUM.APPROVED;
      OfficeAbsenceMessanger.sendApproveCreateAbsenceMessage(officeAbsenceId);
      GoogleCalendarManager.createEvent(officeAbsence);
    } else if (officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.AWAITING_CANCELLATION_APPROVAL
      || officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.REJECT_CANCELLATION) {
      officeAbsence.absence_state_enum_id = ABSENCE_STATE_ENUM.CANCELED;
      OfficeAbsenceMessanger.sendApproveCancelAbsenceMessage(officeAbsenceId);
      GoogleCalendarManager.deleteEvent(officeAbsence);
    }

    await officeAbsence.save();
    return response.send();
  }

  async rejectAbsenceState ({ request, response, params }) {
    const {
      token,
      officeAbsenceId,
    } = request.only(['token', 'officeAbsenceId']);
    if (!token) {
      return response.status(400).send({ name: 'BAD_REQUEST', message: 'Token is required' });
    }

    const absenceToken = AbsenceRequestTokenModel.findBy('token', token);
    if (!absenceToken && moment().isAfter(moment(absenceToken.expiration_date))) {
      return response.status(404).send({ name: 'TOKEN_NOT_FOUND', message: 'Token is invalid or token is expired' });
    }

    const officeAbsence = await OfficeAbsenceModel.find(officeAbsenceId);
    if (!officeAbsence) {
      return response.status(404).send({ name: 'OFFICE_ABSENCE_NOT_FOUND', message: 'Office absence does not exists' });
    }

    if (officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL
      || officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.APPROVED){
      officeAbsence.absence_state_enum_id = ABSENCE_STATE_ENUM.REJECTED;
      OfficeAbsenceMessanger.sendRejectCreateAbsenceMessage(officeAbsenceId);
      GoogleCalendarManager.deleteEvent(officeAbsence);
    } else if (officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.AWAITING_CANCELLATION_APPROVAL
      || officeAbsence.absence_state_enum_id === ABSENCE_STATE_ENUM.CANCELED) {
      officeAbsence.absence_state_enum_id = ABSENCE_STATE_ENUM.REJECT_CANCELLATION;
      OfficeAbsenceMessanger.sendRejectCancelAbsenceMessage(officeAbsenceId);
      GoogleCalendarManager.createEvent(officeAbsence);
    }

    await officeAbsence.save();
    return response.send();
  }
}

module.exports = OfficeAbsenceController;
