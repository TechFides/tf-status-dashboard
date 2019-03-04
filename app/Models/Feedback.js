'use strict';

const Model = use('Model');

class Feedback extends Model {
  static get hidden () {
      return ['updated_at'];
      }

  static get dates () {
    return super.dates.concat(['date']);
  }

  user () {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = Feedback;