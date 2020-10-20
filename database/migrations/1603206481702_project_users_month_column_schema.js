'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProjectUsersMonthColumnSchema extends Schema {
  up() {
    this.alter('project_users', table => {
      table.dateTime('month').notNullable().defaultTo(new Date().toISOString());
    });
  }

  down() {
    this.alter('project_users', table => {
      table.dropColumn('month');
    });
  }
}

module.exports = ProjectUsersMonthColumnSchema;
