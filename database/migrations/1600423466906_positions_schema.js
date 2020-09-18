'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PositionsSchema extends Schema {
  up () {
    this.alter('positions', (table) => {
      table.boolean('send_feedback').defaultTo(0).notNullable();
      table.boolean('is_player').defaultTo(0).notNullable();
    })
  }

  down () {
    this.alter('positions', (table) => {
      table.dropColumn('send_feedback');
      table.dropColumn('is_player');
    })
  }
}

module.exports = PositionsSchema
