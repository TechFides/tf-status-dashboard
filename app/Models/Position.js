'use strict';

const Model = use('Model');

class Position extends Model {
  permissions() {
    return this.belongsToMany('App/Models/Permission').pivotTable('position_permissions');
  }

  costCategories() {
    return this.belongsToMany('App/Models/CostCategory').pivotTable('position_cost_categories');
  }
}

module.exports = Position;
