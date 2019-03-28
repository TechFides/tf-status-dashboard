'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MeetingTimesSchema extends Schema {
  up () {
    this.alter('meeting_times', (table) => {
      table.string('name')
      table.time('time')
    })
  }

  down () {
    this.alter('meeting_times', (table) => {
      table.dropColumn('name')
      table.dropColumn('time')
    })
  }
}

module.exports = MeetingTimesSchema
