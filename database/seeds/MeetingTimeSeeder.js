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
  async run () {
    await Database.table('meeting_times')
      .insert(MeetinTimeSeeder.getInitialData());
  }

  static getInitialData () {
    return [
      {
        week_day: 'Monday',
        hour: '14:00',
      },
      {
        week_day: 'Tuesday',
        hour: '15:00',
      },
      {
        week_day: 'Wednesday',
        hour: '16:00',
      },
    ];
  }
}

module.exports = MeetinTimeSeeder;
