'use strict';

const OfficeAbsenceModel = use('App/Models/OfficeAbsence');
const AbsenceTypeEnumModel = use('App/Models/AbsenceTypeEnum');
const AbsenceStateEnumModel = use('App/Models/AbsenceStateEnum');
const SystemParamModel = use('App/Models/SystemParam');
const UserModel = use('App/Models/User');
const AbsenceApproverModel = use('App/Models/AbsenceApprover');

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
      description,
    } = request.only(['userId', 'absenceStart', 'absenceEnd', 'absenceType', 'approver', 'absenceHoursNumber', 'description']);

    return {
      user_id: userId,
      absence_start: absenceStart,
      absence_end: absenceEnd,
      absence_type_enum_id: absenceType,
      absence_state_enum_id: ABSENCE_STATE_ENUM.WAITING_FOR_APPROVAL,
      absence_approver_id: approver,
      absence_hours_number: absenceHoursNumber,
      calendar_event_title: `${absenceType}-${absenceStart}-${absenceEnd}`,
      description,
    };
  }

  async getOfficeAbsences ({ request, response, params }) {
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

    const officeAbsence = await officeAbsenceQuery.fetch();

    return officeAbsence.toJSON();
  }

  async getAbsenceTypeEnums ({ request, response, params }) {
    const absenceTypeEnumModel = await AbsenceTypeEnumModel
      .query()
      .fetch();

    return absenceTypeEnumModel.toJSON();
  }

  async getAbsenceStateEnums ({ request, response, params }) {
    const absenceStateEnumModel = await AbsenceStateEnumModel
      .query()
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
        absenceApproverList.push(userApprover.approver);
      }
    }

    const absenceApprover = await SystemParamModel.findBy('key', SYSTEM_PARAMS.ABSENCE_APPROVER_ID);
    if (absenceApprover) {
      const defaultApprover = (await UserModel.find(absenceApprover.value)).toJSON();
      const foundDefaultApprover = absenceApproverList.find(approver => approver.id === defaultApprover.id);

      if (!foundDefaultApprover) {
        absenceApproverList.push(defaultApprover);
      }
    }

    return absenceApproverList;
  }

  async createOfficeAbsence ({ request, response, params }) {
    const officeAbsence = new OfficeAbsenceModel();

    officeAbsence.fill(OfficeAbsenceController.mapToDbEntity(request));
    await officeAbsence.save();

    return officeAbsence.toJSON();
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
}

module.exports = OfficeAbsenceController;
