'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class FeedbackSchema extends Schema {
  async up() {
    await use('App/Models/FeedbackEnum').truncate();
    const enumData = [
      {
        id: 1,
        description: 'GOOD',
      },
      {
        id: 2,
        description: 'OK',
      },
      {
        id: 3,
        description: 'BAD',
      },
    ];

    await use('App/Models/FeedbackEnum').createMany(enumData);
  }

  async down() {
    await use('App/Models/FeedbackEnum').truncate();
    const enumData = [
      {
        id: 1,
        description: 'AMAZING',
      },
      {
        id: 2,
        description: 'GOOD',
      },
      {
        id: 3,
        description: 'BAD',
      },
      {
        id: 4,
        description: 'HORIBLE',
      },
    ];

    await use('App/Models/FeedbackEnum').createMany(enumData);
  }
}

module.exports = FeedbackSchema;
