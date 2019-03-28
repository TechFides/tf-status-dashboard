'use strict';

const Schema = use('Schema');

class MeetingTimeSchema extends Schema {
  up () {
    this.create('meeting_times', (table) => {
      table.increments();
      table.timestamps();
      table.string('week_day');
      table.time('hour');
    })
  }

  down () {
    this.drop('meeting_times')
  }
}

module.exports = MeetingTimeSchema
