'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UsersSchema extends Schema {
  up() {
    this.table('users', table => {
      table.boolean('send_feedback').defaultTo(true);
    });
  }

  down() {
    this.table('users', table => {
      table.dropColumn('send_feedback');
    });
  }
}

module.exports = UsersSchema;
