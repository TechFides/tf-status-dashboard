'use strict';

const Model = use('Model');

class ProjectUser extends Model {
  static get hidden () {
    return ['created_at', 'updated_at'];
  }

  project () {
    return this.belongsTo('App/Models/Project');
  }

  user () {
    return this.belongsTo('App/Models/User');
  }

  projectExpModifier () {
    return this.belongsTo('App/Models/ProjectExpModifier');
  }
}

module.exports = ProjectUser;
