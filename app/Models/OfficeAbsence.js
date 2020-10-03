'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class OfficeAbsence extends Model {
  absenceTypeEnum() {
    return this.belongsTo('App/Models/AbsenceTypeEnum');
  }

  absenceStateEnum() {
    return this.belongsTo('App/Models/AbsenceStateEnum');
  }

  user() {
    return this.belongsTo('App/Models/User');
  }

  absenceApprover() {
    return this.belongsTo('App/Models/User', 'absence_approver_id');
  }
}

module.exports = OfficeAbsence;
