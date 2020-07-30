'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class AbsenceApprover extends Model {
  user () {
    return this.belongsTo('App/Models/User','user_id');
  }

  approver () {
    return this.belongsTo('App/Models/User','approver_id');
  }
}

module.exports = AbsenceApprover;
