'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class PositionsSchema extends Schema {
  up() {
    this.create('positions', table => {
      table.integer('id').notNullable().primary();
      table.string('name').notNullable();
      table.timestamps();
    });
  }

  down() {
    this.drop('positions');
  }
}

module.exports = PositionsSchema;
