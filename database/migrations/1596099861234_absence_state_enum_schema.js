'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AbsenceStateEnumSchema extends Schema {
  async up() {
    const enumData = [
      {
        name: 'APPROVED',
        value: 'Schválena',
      },
      {
        name: 'REJECTED',
        value: 'Zamítnuta',
      },
      {
        name: 'AWAITING_CANCELLATION_APPROVAL',
        value: 'Čeká na schválení o zrušení',
      },
      {
        name: 'DONE',
        value: 'Proběhla',
      },
      {
        name: 'CANCELED',
        value: 'Zrušena',
      },
      {
        name: 'WAITING_FOR_APPROVAL',
        value: 'Čeká na schválení',
      },
    ];

    await use('App/Models/AbsenceStateEnum').createMany(enumData);
  }

  down() {}
}

module.exports = AbsenceStateEnumSchema;
