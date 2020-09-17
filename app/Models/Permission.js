'use strict';

const Model = use('Model');

class Permission extends Model {
  position () {
    return this.belongsToMany('App/Models/Position');
  }
}

module.exports = Permission;
