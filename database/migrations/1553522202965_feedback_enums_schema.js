'use strict'
/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FeedbackEnumsSchema extends Schema {
  async up () {
    const enumData = [
      {
        id: 1,
        description: 'FEEDBACKS',
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
  };

  async down () {
    await use('App/Models/FeedbackEnum').truncate();
  }
}

module.exports = FeedbackEnumsSchema
