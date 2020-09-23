'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProjectsSchema extends Schema {
  up() {
    this.alter('projects', table => {
      table.integer('meeting_time_id').unsigned().references('id').inTable('meeting_times').onDelete('CASCADE').index();
    });
  }

  down() {
    this.table('projects', table => {
      // reverse alternations
      table.dropForeign('meeting_time_id');
    });
  }
}

module.exports = ProjectsSchema;
