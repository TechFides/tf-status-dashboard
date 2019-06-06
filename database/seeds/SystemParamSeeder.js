'use strict';

/*
|--------------------------------------------------------------------------
| SystemParamSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Database = use('Database');

class SystemParamSeeder {
  static getInitialData () {
    return [
      {
        key: 'feedbackCrontab',
        value: '30 9 * * 1',
        type: 1,
      },
    ];
  }

  async run () {
    await Database.table('system_params')
      .insert(SystemParamSeeder.getInitialData());
  }
}

module.exports = SystemParamSeeder;
