'use strict';

const OfficeAbsenceModel = use('App/Models/OfficeAbsence');
const AbsenceTypeModel = use('App/Models/AbsenceTypeEnum');
const AbsenceStateModel = use('App/Models/AbsenceStateEnum');
const SystemParamModel = use('App/Models/SystemParam');
const UserModel = use('App/Models/User');
const AbsenceApproverModel = use('App/Models/AbsenceApprover');

const { SYSTEM_PARAMS } = require('../../../constants');

class OfficeAbsenceController {
  async getOfficeAbsences ({ request, response, params }) {
    const { id } = params;
    const officeAbsence = await OfficeAbsenceModel
      .query()
      .where('user_id', id)
      .with('user')
      .with('absenceType')
      .with('absenceState')
      .fetch();

    return officeAbsence.toJSON();
  }

  async getAbsenceType ({ request, response, params }) {
    const absenceTypeModel = await AbsenceTypeModel
      .query()
      .fetch();

    return absenceTypeModel.toJSON();
  }

  async getAbsenceState ({ request, response, params }) {
    const absenceStateModel = await AbsenceStateModel
      .query()
      .fetch();

    return absenceStateModel.toJSON();
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
