'use strict';

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Database = use('Database');

class RoleSeeder {
  async run () {
    await Database.table('roles')
      .insert(RoleSeeder.getInitialData());
  }

  static getInitialData () {
    return [
      {
        id: 1,
        slug: 'user',
        name: 'User',
      },
      {
        id: 2,
        slug: 'admin',
        name: 'Administrator',
      },
    ];
  }
}

module.exports = RoleSeeder;
