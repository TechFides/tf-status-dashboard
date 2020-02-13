'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserProjectParticipationsSchema extends Schema {
  up () {
    this.alter('user_project_participations', (table) => {
      table.date('date').notNullable();
      table.integer('time_spent').notNullable();
    })
  }

  down () {
    this.drop('user_project_participations')
  }
}

module.exports = UserProjectParticipationsSchema
