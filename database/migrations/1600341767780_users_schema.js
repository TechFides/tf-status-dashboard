'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UsersSchema extends Schema {
  up() {
    this.alter('users', table => {
      table.boolean('is_admin').defaultTo(0).notNullable();
      table.dropColumn('send_feedback');
      table.integer('position_id').unsigned().index();
      table.foreign('position_id').references('positions');
    });
  }

  down() {
    this.alter('users', table => {
      table.dropColumn('is_admin');
      table.dropColumn('position_id');
      table.boolean('send_feedback').defaultTo(0).notNullable();
    });
  }
}

module.exports = UsersSchema;
