'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OfficeAbsenceSchema extends Schema {
  up() {
    this.create('office_absences', table => {
      table.increments();
      table.date('absence_start').notNullable();
      table.date('absence_end').notNullable();
      table.integer('absence_type_enum_id').notNullable();
      table.foreign('absence_type_enum_id').references('absence_type_enums');
      table.integer('absence_state_enum_id').notNullable();
      table.foreign('absence_state_enum_id').references('absence_state_enums');
      table.integer('user_id').notNullable();
      table.foreign('user_id').references('users');
      table.integer('absence_approver_id').notNullable();
      table.foreign('absence_approver_id').references('users');
      table.integer('absence_hours_number').notNullable();
      table.string('calendar_event_title').notNullable();
      table.text('description');
      table.timestamps();
    });
  }

  down() {
    this.drop('office_absences');
  }
}

module.exports = OfficeAbsenceSchema;
