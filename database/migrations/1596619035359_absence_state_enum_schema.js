'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AbsenceStateEnumSchema extends Schema {
  async up() {
    await use('App/Models/AbsenceStateEnum').truncate();

    const enumData = [
      {
        id: 1,
        name: 'APPROVED',
        value: 'Schválena',
      },
      {
        id: 2,
        name: 'REJECTED',
        value: 'Zamítnuta',
      },
      {
        id: 3,
        name: 'AWAITING_CANCELLATION_APPROVAL',
        value: 'Čeká na schválení o zrušení',
      },
      {
        id: 4,
        name: 'DONE',
        value: 'Proběhla',
      },
      {
        id: 5,
        name: 'CANCELED',
        value: 'Zrušena',
      },
      {
        id: 6,
        name: 'WAITING_FOR_APPROVAL',
        value: 'Čeká na schválení',
      },
    ];

    await use('App/Models/AbsenceStateEnum').createMany(enumData);
  }

  async down() {
    await use('App/Models/AbsenceStateEnum').truncate();

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
}

module.exports = AbsenceStateEnumSchema;
