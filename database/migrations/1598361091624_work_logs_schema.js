'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WorkLogsSchema extends Schema {
  up () {
    this.create('work_logs', (table) => {
      table.increments()
      table.dateTime('started').notNullable();
      table.integer('time_spent').notNullable();
      table.integer('user_id').notNullable();
      table.foreign('user_id').references('users');
      table.integer('cost_category').notNullable();
      table.text('description');
      table.timestamps();
    })
  }

  down () {
    this.drop('work_logs')
  }
}

module.exports = WorkLogsSchema
