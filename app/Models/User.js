'use strict';

const Model = use('Model');

class User extends Model {
  static boot() {
    super.boot();
    this.addHook('beforeCreate', 'UserHook.hashPassword');
    this.addHook('beforeUpdate', 'UserHook.hashPassword');
  }

  static get hidden() {
    return ['password', 'created_at'];
  }

  bonusExps() {
    return this.hasMany('App/Models/BonusExp');
  }

  userTotalExp() {
    return this.hasMany('App/Models/UserTotalExp');
  }

  projectParticipations() {
    return this.hasMany('App/Models/UserProjectParticipation');
  }

  feedback() {
    return this.hasMany('App/Models/Feedback');
  }

  projectUser() {
    return this.hasMany('App/Models/ProjectUser');
  }

  feedbackValue() {
    return this.hasOne('App/Models/FeedbackEnum');
  }

  user() {
    return this.hasOne('App/Models/AbsenceApprover', 'id', 'user_id');
  }

  approver() {
    return this.hasOne('App/Models/AbsenceApprover', 'id', 'approver_id');
  }

  officeAbsence() {
    return this.hasMany('App/Models/OfficeAbsence');
  }

  absence_approver() {
    return this.hasOne('App/Models/OfficeAbsence', 'id', 'absence_approver_id');
  }

  position() {
    return this.belongsTo('App/Models/Position');
  }
}

module.exports = User;
