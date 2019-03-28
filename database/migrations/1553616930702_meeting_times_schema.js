'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MeetingTimesSchema extends Schema {
  up () {
    this.alter('meeting_times', (table) => {
      table.dropColumn('hour')
      table.dropColumn('name')
    })
  }

  down () {
    this.alter('meeting_times', (table) => {
      table.time('hour')
      table.text('name')
    })
  }
}

module.exports = MeetingTimesSchema
