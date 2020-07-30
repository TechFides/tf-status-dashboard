'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class OfficeAbsence extends Model {
  static get hidden () {
    return ['created_at', 'updated_at'];
  }

  absenceType () {
    return this.belongsTo('App/Models/AbsenceTypeEnum');
  }

  absenceState () {
    return this.belongsTo('App/Models/AbsenceStateEnum');
  }

  user () {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = OfficeAbsence;
