'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceTypeEnumSchema extends Schema {
  async up () {
    await use('App/Models/AbsenceTypeEnum').truncate();

    const enumData = [
      {
        id: 1,
        name: 'HOME_OFFICE',
        value: 'HO',
      },
      {
        id: 2,
        name: 'HOLIDAY',
        value: 'Dovolená',
      },
      {
        id: 3,
        name: 'WORK_TRAVEL',
        value: 'Pracovní výjezd',
      },
      {
        id: 4,
        name: 'UNPAID_HOLIDAY',
        value: 'Neplacené volno',
      },
    ];

    await use('App/Models/AbsenceTypeEnum').createMany(enumData);
  }

  async down () {
    await use('App/Models/AbsenceTypeEnum').truncate();

    const enumData = [
      {
        id: 1,
        name: 'HOME_OFFICE',
        value: 'HO',
      },
      {
        id: 2,
        name: 'HOLIDAY',
        value: 'Volno',
      },
      {
        id: 3,
        name: 'WORK_TRAVEL',
        value: 'Pracovní výjezd',
      },
      {
        id: 4,
        name: 'UNPAID_HOLIDAY',
        value: 'Neplacené volno',
      },
    ];

    await use('App/Models/AbsenceTypeEnum').createMany(enumData);
  }
}

module.exports = AbsenceTypeEnumSchema
