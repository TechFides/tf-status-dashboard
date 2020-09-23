'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class JiraSynchronizationsSchema extends Schema {
  up() {
    this.create('jira_synchronizations', table => {
      table.increments();
      table.date('date').notNullable();
      table.integer('status').notNullable();
      table.integer('error');
      table.string('message');
      table.timestamps();
    });
  }

  down() {
    this.drop('jira_synchronizations');
  }
}

module.exports = JiraSynchronizationsSchema;
