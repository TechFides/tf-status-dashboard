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
      first_name: 'Tomáš',
      last_name: 'Bruckner',
      username: 'Tom',
    });

    await user.roles().attach([1]);
  }
}

module.exports = UserSeeder;
