'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JiraSynchronizationsSchema extends Schema {
  up () {
    this.alter('jira_synchronizations', (table) => {
      table.dropColumn('date');
      table.dropColumn('message');
      table.text('message');
      table.date('start_date').notNullable();
      table.date('finish_date').notNullable();
    })
  }

  down () {
    this.alter('jira_synchronizations', (table) => {
      table.dropColumn('start_date');
      table.date('date').notNullable();
      table.dropColumn('finish_date');
      table.dropColumn('message');
      table.string('message');
    })
  }
}

module.exports = JiraSynchronizationsSchema
