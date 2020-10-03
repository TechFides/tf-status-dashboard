'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class CostCategory extends Model {
  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  position() {
    return this.belongsToMany('App/Models/Position');
  }
}

module.exports = CostCategory;
