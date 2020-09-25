'use strict';

const Model = use('Model');

class JiraSynchronization extends Model {
  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  static get dates() {
    return super.dates.concat(['date']);
  }
}

module.exports = JiraSynchronization;
