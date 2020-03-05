'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JiraSynchronizationsSchema extends Schema {
  up () {
    this.alter('jira_synchronizations', (table) => {
      table.dropColumn('date');
      table.text('message').alter();
      table.date('start_date');
      table.date('finish_date');
    })
  }

  down () {
    this.alter('jira_synchronizations', (table) => {
      table.dropColumn('start_date');
      table.date('date');
      table.dropColumn('finish_date');
      table.dropColumn('message');
      table.string('message');
    })
  }
}

module.exports = JiraSynchronizationsSchema
