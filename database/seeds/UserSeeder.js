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

const USER_ROLES = {
  USER: 1,
  ADMIN: 2,
};

class UserSeeder {
  async run () {
    const user = await Factory.model('App/Models/User').create({
      first_name: 'admin',
      last_name: 'admin',
      username: 'admin',
      password: 'admin',
      is_active: 1,
    });

    await user.roles().attach([USER_ROLES.USER, USER_ROLES.ADMIN]);
  }
}

module.exports = UserSeeder;
