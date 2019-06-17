'use strict';

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory');

class UserSeeder {
  async run () {
    const user = await Factory.model('App/Models/User').create({
      first_name: 'admin',
      last_name: 'admin',
      username: 'admin',
      password: 'admin',
      is_active: 1,
    });

    await user.roles().attach([1, 2]);
  }
}

module.exports = UserSeeder;
