'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OfficeAbsenceSchema extends Schema {
  up () {
    this.alter('office_absences', (table) => {
      table.dropColumn('description');
      table.text('general_description');
      table.text('approver_description');
    })
  }

  down () {
    this.alter('office_absences', (table) => {
      table.dropColumn('general_description');
      table.dropColumn('approver_description');
      table.text('description');
    })
  }
}

module.exports = OfficeAbsenceSchema
