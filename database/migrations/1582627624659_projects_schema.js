'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectsSchema extends Schema {
  up () {
    this.alter('projects', (table) => {
      table.string('slack_channel').notNullable();
    })
  }

  down () {
    this.alter('projects', (table) => {
      table.dropColumn('slack_channel');
    })
  }
}

module.exports = ProjectsSchema
