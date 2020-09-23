'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserProjectParticipationsSchema extends Schema {
  up() {
    this.alter('user_project_participations', table => {
      table.date('date').notNullable();
      table.integer('time_spent').notNullable();
    });
  }

  down() {
    this.alter('user_project_participations', table => {
      table.dropColumn('date');
      table.dropColumn('time_spent');
    });
  }
}

module.exports = UserProjectParticipationsSchema;
