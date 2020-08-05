'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceApproverSchema extends Schema {
  up () {
    this.create('absence_approvers', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users');
      table.integer('approver_id').unsigned().notNullable();
      table.foreign('approver_id').references('users');
      table.timestamps()
    })
  }

  down () {
    this.drop('absence_approvers')
  }
}

module.exports = AbsenceApproverSchema
