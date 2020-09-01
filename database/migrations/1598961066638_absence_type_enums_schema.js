'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceTypeEnumsSchema extends Schema {
  up () {
    this.alter('absence_type_enums', (table) => {
      table.string('short_cut').notNullable();
    })
  }

  down () {
    this.alter('absence_type_enums', (table) => {
      table.dropColumn('short_cut');
    })
  }
}

module.exports = AbsenceTypeEnumsSchema
