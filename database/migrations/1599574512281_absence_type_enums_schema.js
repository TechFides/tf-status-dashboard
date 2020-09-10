'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceTypeEnumsSchema extends Schema {
  async up () {
    await use('App/Models/AbsenceTypeEnum').truncate();

    const enumData = [
      {
        id: 1,
        name: 'HOME_OFFICE',
        value: 'HO',
        short_cut: 'HO',
      },
      {
        id: 2,
        name: 'HOLIDAY',
        value: 'Dovolená',
        short_cut: 'volno',
      },
      {
        id: 3,
        name: 'WORK_TRAVEL',
        value: 'Out of office',
        short_cut: 'OOO',
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
        short_cut: 'HO',
      },
      {
        id: 2,
        name: 'HOLIDAY',
        value: 'Dovolená',
        short_cut: 'volno',
      },
      {
        id: 3,
        name: 'WORK_TRAVEL',
        value: 'Out of office',
        short_cut: 'OOO',
      },
      {
        id: 4,
        name: 'UNPAID_HOLIDAY',
        value: 'Neplacené volno',
        short_cut: 'volno',
      },
    ];

    await use('App/Models/AbsenceTypeEnum').createMany(enumData);
  }
}

module.exports = AbsenceTypeEnumsSchema
