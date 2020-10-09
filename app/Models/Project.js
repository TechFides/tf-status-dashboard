'use strict';

const Model = use('Model');

class Project extends Model {
  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  notes() {
    return this.hasMany('App/Models/Note');
  }

  projectParticipations() {
    return this.hasMany('App/Models/UserProjectParticipation');
  }

  sitdownProjectRating() {
    return this.hasMany('App/Models/SitdownProjectRating');
  }

  projectUser() {
    return this.hasOne('App/Models/ProjectUser');
  }

  meetingTime() {
    return this.belongsTo('App/Models/MeetingTime');
  }

  slackChannel() {
    return this.belongsTo('App/Models/SlackChannel');
  }
}

module.exports = Project;
