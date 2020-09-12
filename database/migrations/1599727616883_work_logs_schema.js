'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WorkLogsSchema extends Schema {
  up () {
    this.alter('work_logs', (table) => {
      table.date('started').alter();
    })
  }

  down () {
    this.alter('work_logs', (table) => {
      table.dateTime('started').alter();
    })
  }
}

module.exports = WorkLogsSchema
