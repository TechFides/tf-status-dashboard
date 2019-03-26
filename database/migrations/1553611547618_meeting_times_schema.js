'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MeetingTimesSchema extends Schema {
  up () {
    this.alter('meeting_times', (table) => {
      table.dropColumn('weekDay')
      table.integer('weekDay').unsigned();
    })
  }

  down () {
    this.table('meeting_times', (table) => {
      // reverse alternations
    })
  }
}

module.exports = MeetingTimesSchema
