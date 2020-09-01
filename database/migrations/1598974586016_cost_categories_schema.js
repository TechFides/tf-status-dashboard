'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CostCategoriesSchema extends Schema {
  up () {
    this.create('cost_categories', (table) => {
      table.integer('id').notNullable().primary();
      table.string('name').notNullable();
      table.timestamps();
    })
  }

  down () {
    this.drop('cost_categories')
  }
}

module.exports = CostCategoriesSchema
