'use strict';

const Model = use('Model');

class User extends Model {
  static boot () {
    super.boot();
    this.addHook('beforeCreate', 'UserHook.hashPassword');
    this.addHook('beforeUpdate', 'UserHook.hashPassword');
  }

  static get hidden () {
    return ['password', 'created_at', 'updated_at'];
  }

  static get traits () {
    return [
      '@provider:Adonis/Acl/HasRole',
    ];
  }

  bonusExps () {
    return this.hasMany('App/Models/BonusExp');
  }

  projectParticipations () {
    return this.hasMany('App/Models/UserProjectParticipation');
  }

  feedback () {
    return this.hasMany('App/Models/Feedback');
  }

  feedbackValue () {
    return this.hasOne('App/Models/FeedbackEnum');
  }
}

module.exports = User;
