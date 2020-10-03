'use strict';

/*
|--------------------------------------------------------------------------
| MeetingTimeSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Database = use('Database');

class MeetinTimeSeeder {
  async run() {
    await Database.table('meeting_times').insert(MeetinTimeSeeder.getInitialData());
  }

  static getInitialData() {
    return [
      {
        week_day: '1',
        time: '14:00',
        name: 'Test1',
      },
      {
        week_day: '2',
        time: '15:00',
        name: 'Test2',
      },
      {
        week_day: '3',
        time: '16:00',
        name: 'Test3',
      },
    ];
  }
}

module.exports = MeetinTimeSeeder;
