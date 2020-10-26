'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');
const moment = require('moment');

class ProjectUsersMonthColumnSchema extends Schema {
  up() {
    this.alter('project_users', table => {
      table.dateTime('month').notNullable().defaultTo(this.fn.now());
    });
  }

  down() {
    this.alter('project_users', table => {
      table.dropColumn('month');
    });
  }
}

module.exports = ProjectUsersMonthColumnSchema;
