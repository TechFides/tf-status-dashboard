'use strict';

const Model = use('Model');

class AbsenceRequestToken extends Model {
  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  user() {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = AbsenceRequestToken;
