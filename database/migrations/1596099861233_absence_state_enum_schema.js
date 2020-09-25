'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AbsenceStateEnumSchema extends Schema {
  up() {
    this.create('absence_state_enums', table => {
      table.increments();
      table.string('name').notNullable();
      table.string('value').notNullable();
      table.timestamps();
    });
  }

  down() {
    this.drop('absence_state_enums');
  }
}

module.exports = AbsenceStateEnumSchema;
