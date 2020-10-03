'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class SystemParam extends Model {
  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  static get primaryKey() {
    return 'key';
  }

  static get incrementing() {
    return false;
  }
}

module.exports = SystemParam;
