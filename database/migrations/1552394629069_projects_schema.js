'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectsSchema extends Schema {
  up () {
    this.alter('projects', (table) => {
      table.integer('meeting_time_id').index();
    })
  }

  down () {
    this.table('projects', (table) => {
      // reverse alternations
      table.dropColumn('meeting_time_id');
    })
  }
}

module.exports = ProjectsSchema
