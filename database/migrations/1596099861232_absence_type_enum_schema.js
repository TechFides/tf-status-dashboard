'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AbsenceTypeEnumSchema extends Schema {
  async up() {
    const enumData = [
      {
        name: 'HOME_OFFICE',
        value: 'HO',
      },
      {
        name: 'HOLIDAY',
        value: 'Dovolená',
      },
      {
        name: 'WORK_TRAVEL',
        value: 'Pracovní výjezd',
      },
      {
        name: 'UNPAID_HOLIDAY',
        value: 'Neplacená dovolená',
      },
    ];

    await use('App/Models/AbsenceTypeEnum').createMany(enumData);
  }

  down() {}
}

module.exports = AbsenceTypeEnumSchema;
