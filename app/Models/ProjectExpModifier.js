'use strict';

const Model = use('Model');

class ProjectExpModifier extends Model {
  static get hidden () {
    return ['created_at', 'updated_at'];
  }

  projectUser () {
    return this.hasMany('App/Models/ProjectUser');
  }
}

module.exports = ProjectExpModifier;
