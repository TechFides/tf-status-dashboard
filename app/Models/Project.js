'use strict';

const Model = use('Model');

class Project extends Model {
  static get hidden () {
    return ['created_at', 'updated_at'];
  }

  notes () {
    return this.hasMany('App/Models/Note');
  }

  projectParticipations () {
    return this.hasMany('App/Models/UserProjectParticipation');
  }

  standupProjectRating () {
    return this.hasMany('App/Models/StandupProjectRating');
  }

  projectUser () {
    return this.hasOne('App/Models/ProjectUser');
  }

  meetingTime () {
    return this.belongsTo('App/Models/MeetingTime');
  }
}

module.exports = Project;
