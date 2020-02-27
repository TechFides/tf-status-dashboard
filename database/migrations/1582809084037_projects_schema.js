'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectsSchema extends Schema {
  up () {
    this.alter('projects', (table) => {
      table.string('slack_channel_id').notNullable();
      table.foreign('slack_channel_id').references('slack_channels');
    })
  }

  down () {
    this.alter('projects', (table) => {
      table.dropForeign('slack_channel_id');
    })
  }
}

module.exports = ProjectsSchema
