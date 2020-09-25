'use strict';

const Model = use('Model');

class MeetingTime extends Model {
  static get hidden() {
    return ['updated_at', 'created_at'];
  }

  projects() {
    return this.hasMany('App/Models/Project');
  }
}

module.exports = MeetingTime;
