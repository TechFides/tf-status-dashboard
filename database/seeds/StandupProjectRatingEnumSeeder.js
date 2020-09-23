'use strict';

/*
|--------------------------------------------------------------------------
| StandupProjectRatingEnumSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Database = use('Database');

class StandupProjectRatingEnumSeeder {
  async run() {
    await Database.table('standup_project_rating_enums').insert(StandupProjectRatingEnumSeeder.getInitialData());
  }

  static getInitialData() {
    return [
      {
        id: 0,
        name: 'HIATUS',
        description: 'Nothing was done',
        value: 0,
      },
      {
        id: 1,
        name: 'FAIL',
        description: 'Error with big negative impact on our side',
        value: -100,
      },
      {
        id: 2,
        name: 'BAD',
        description: 'Below average',
        value: 30,
      },
      {
        id: 3,
        name: 'STANDARD',
        description: 'Average',
        value: 60,
      },
      {
        id: 4,
        name: 'GOOD',
        description: 'Doing better than expected',
        value: 90,
      },
      {
        id: 5,
        name: 'AMAZING',
        description: 'Great positive impact from our side',
        value: 120,
      },
      {
        id: 6,
        name: 'STANDARD_v2',
        description: 'Average',
        value: 50,
      },
      {
        id: 7,
        name: 'GOOD_v2',
        description: 'Doing better than expected',
        value: 80,
      },
    ];
  }
}

module.exports = StandupProjectRatingEnumSeeder;
