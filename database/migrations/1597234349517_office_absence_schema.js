'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OfficeAbsenceSchema extends Schema {
  up() {
    this.alter('office_absences', table => {
      table.string('google_event_id');
    });
  }

  down() {
    this.alter('office_absences', table => {
      table.dropColumn('google_event_id');
    });
  }
}

module.exports = OfficeAbsenceSchema;
