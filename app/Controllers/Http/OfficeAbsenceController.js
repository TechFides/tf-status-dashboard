'use strict';

const OfficeAbsenceModel = use('App/Models/OfficeAbsence');
const AbsenceTypeEnumModel = use('App/Models/AbsenceTypeEnum');
const AbsenceStateEnumModel = use('App/Models/AbsenceStateEnum');
const SystemParamModel = use('App/Models/SystemParam');
const UserModel = use('App/Models/User');
const AbsenceApproverModel = use('App/Models/AbsenceApprover');

const { SYSTEM_PARAMS } = require('../../../constants');

class OfficeAbsenceController {
  async getOfficeAbsences ({ request, response, params }) {
    const { id } = params;
    let { absenceType, absenceState } = request.get();
    const officeAbsenceQuery = OfficeAbsenceModel
      .query()
      .with('user')
      .with('absenceApprover')
      .with('absenceTypeEnum')
      .with('absenceStateEnum')

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

  async getApprover ({ request, response, params }) {
    const { id } = params;
    const absenceApproverList = [];
    const absenceApprover = await SystemParamModel.find(SYSTEM_PARAMS.ABSENCE_APPROVER);

    const defaultApprover = (await UserModel.findBy('email', absenceApprover.value)).toJSON();
    const userApprover = (await AbsenceApproverModel
      .query()
      .where('approved_user_id', id)
      .with('absenceApprover')
      .fetch()).toJSON();

    absenceApproverList.push(defaultApprover, userApprover.absenceApprover);

    return absenceApproverList;
  }
}

module.exports = OfficeAbsenceController;
