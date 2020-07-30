'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceTypeEnumSchema extends Schema {
  async up () {
    this.create('absence_type_enums', (table) => {
      table.increments()
      table.string('name').notNullable();
      table.timestamps()
    })
  }

  down () {
    this.drop('absence_type_enums')
  }
}

module.exports = AbsenceTypeEnumSchema
