'use strict';

const Model = use('Model');

class UserTotalExp extends Model {
  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  static get dates() {
    return super.dates.concat(['date']);
  }

  user() {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = UserTotalExp;
