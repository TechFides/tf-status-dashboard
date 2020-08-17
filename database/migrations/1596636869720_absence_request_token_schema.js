'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceRequestTokenSchema extends Schema {
  up () {
    this.create('absence_request_tokens', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users');
      table.date('expiration_date');
      table.string('token').notNullable();
      table.timestamps();
    })
  }

  down () {
    this.drop('absence_request_tokens')
  }
}

module.exports = AbsenceRequestTokenSchema
