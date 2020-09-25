'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class PositionCostCategoriesSchema extends Schema {
  up() {
    this.create('position_cost_categories', table => {
      table.increments();
      table.integer('position_id').unsigned().index();
      table.foreign('position_id').references('positions');
      table.integer('cost_category_id').unsigned().index();
      table.foreign('cost_category_id').references('cost_categories');
      table.timestamps();
    });
  }

  down() {
    this.drop('position_cost_categories');
  }
}

module.exports = PositionCostCategoriesSchema;
