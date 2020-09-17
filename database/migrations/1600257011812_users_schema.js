'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.alter('users', (table) => {
      table.boolean('is_admin').defaultTo(0).notNullable();
    })
  }

  down () {
    this.alter('users', (table) => {
      table.dropColumn('is_admin');
    })
  }
}

module.exports = UsersSchema
