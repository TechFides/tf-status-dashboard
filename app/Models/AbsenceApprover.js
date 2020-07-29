'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class AbsenceApprover extends Model {
  approvedUser () {
    return this.belongsTo('App/Models/User','approved_user_id');
  }

  absenceApprover () {
    return this.belongsTo('App/Models/User','absence_approver_id');
  }
}

module.exports = AbsenceApprover;
