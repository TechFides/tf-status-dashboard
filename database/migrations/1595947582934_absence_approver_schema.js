'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceApproverSchema extends Schema {
  up () {
    this.create('absence_approvers', (table) => {
      table.increments();
      table.integer('approved_user_id').unsigned().notNullable();
      table.foreign('approved_user_id').references('users');
      table.integer('absence_approver_id').unsigned().notNullable();
      table.foreign('absence_approver_id').references('users');
      table.timestamps()
    })
  }

  down () {
    this.drop('absence_approvers')
  }
}

module.exports = AbsenceApproverSchema
