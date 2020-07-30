'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceTypeEnumSchema extends Schema {
  async up () {
    const enumData = [
      {
        name: 'HO',
      },
      {
        name: 'Dovolená',
      },
      {
        name: 'Pracovní výjezd',
      },
      {
        name: 'Neplacená dovolená',
      },
    ];

    await use('App/Models/AbsenceTypeEnum').createMany(enumData);
  }

  down () {
  }
}

module.exports = AbsenceTypeEnumSchema
