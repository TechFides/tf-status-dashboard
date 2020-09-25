'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UsersSchema extends Schema {
  up() {
    this.table('users', table => {
      table.string('email');
    });
  }

  down() {
    this.table('users', table => {
      table.dropColumn('email');
    });
  }
}

module.exports = UsersSchema;
