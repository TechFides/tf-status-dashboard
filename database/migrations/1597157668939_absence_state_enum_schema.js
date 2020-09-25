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
        value: 'Schválený',
      },
      {
        id: 2,
        name: 'REJECTED',
        value: 'Zamítnutý',
      },
      {
        id: 3,
        name: 'AWAITING_CANCELLATION_APPROVAL',
        value: 'Čeká na schválení o zrušení',
      },
      {
        id: 4,
        name: 'DONE',
        value: 'Proběhlý',
      },
      {
        id: 5,
        name: 'CANCELED',
        value: 'Zrušený',
      },
      {
        id: 6,
        name: 'WAITING_FOR_APPROVAL',
        value: 'Čeká na schválení',
      },
      {
        id: 7,
        name: 'REJECT_CANCELLATION',
        value: 'Zamítnuté zrušení',
      },
    ];

    await use('App/Models/AbsenceStateEnum').createMany(enumData);
  }

  async down() {
    await use('App/Models/AbsenceStateEnum').truncate();

    const enumData = [
      {
        id: 1,
        name: 'APPROVED',
        value: 'Schválený',
      },
      {
        id: 2,
        name: 'REJECTED',
        value: 'Zamítnutý',
      },
      {
        id: 3,
        name: 'AWAITING_CANCELLATION_APPROVAL',
        value: 'Čeká na schválení o zrušení',
      },
      {
        id: 4,
        name: 'DONE',
        value: 'Proběhlý',
      },
      {
        id: 5,
        name: 'CANCELED',
        value: 'Zrušený',
      },
      {
        id: 6,
        name: 'WAITING_FOR_APPROVAL',
        value: 'Čeká na schválení',
      },
      {
        id: 7,
        name: 'REJECT_CANCELLATION',
        value: 'Zamítnutý zrušení',
      },
    ];

    await use('App/Models/AbsenceStateEnum').createMany(enumData);
  }
}

module.exports = AbsenceStateEnumSchema;
