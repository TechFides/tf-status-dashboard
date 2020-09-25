'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class GoogleTokensSchema extends Schema {
  up() {
    this.create('google_tokens', table => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users');
      table.boolean('status').defaultTo(0).notNullable();
      table.string('token').notNullable();
      table.timestamps();
    });
  }

  down() {
    this.drop('google_tokens');
  }
}

module.exports = GoogleTokensSchema;
