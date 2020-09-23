'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class MeetingTimesSchema extends Schema {
  up() {
    this.alter('meeting_times', table => {
      table.text('name');
    });
  }

  down() {
    this.alter('meeting_times', table => {
      table.dropColumn('name');
    });
  }
}

module.exports = MeetingTimesSchema;
