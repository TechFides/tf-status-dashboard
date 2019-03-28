'use strict';

/*
|--------------------------------------------------------------------------
| FeedbackEnumSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/
const Database = use('Database');

class FeedbackEnumSeeder {
  async run () {
    await Database.table('feedback_enums')
      .insert(FeedbackEnumSeeder.getInitialData());
  }

  static getInitialData () {
    return [
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
  }
}

module.exports = FeedbackEnumSeeder;
