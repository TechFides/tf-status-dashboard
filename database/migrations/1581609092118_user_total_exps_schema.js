'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserTotalExpsSchema extends Schema {
  up () {
    this.create('user_total_exps', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users');
      table.date('date').notNullable();
      table.integer('total_exp').notNullable();
      table.timestamps();
    })
  }

  down () {
    this.drop('user_total_exps')
  }
}

module.exports = UserTotalExpsSchema
