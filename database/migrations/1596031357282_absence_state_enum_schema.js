'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AbsenceStateEnumSchema extends Schema {
  async up () {
    const enumData = [
      {
        name: 'Schválena',
      },
      {
        name: 'Zamítnuta',
      },
      {
        name: 'Čeká na schválení o zrušení',
      },
      {
        name: 'Proběhla',
      },
      {
        name: 'Zrušena',
      },
      {
        name: 'Čeká na schválení',
      },
    ];

    await use('App/Models/AbsenceStateEnum').createMany(enumData);
  }

  down () {
  }
}

module.exports = AbsenceStateEnumSchema
