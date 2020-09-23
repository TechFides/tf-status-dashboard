'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class AbsenceTypeEnum extends Model {
  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  officeAbsence() {
    return this.hasOne('App/Models/OfficeAbsence');
  }
}

module.exports = AbsenceTypeEnum;
