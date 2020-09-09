'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Factory = use('Factory');
const USER_ROLES = {
  ADMINISTRATION: 1,
  PRODUCTION: 2,
  SALES: 3,
  HR: 4,
};

class UsersSchema extends Schema {
  async up () {
    const user = await Factory.model('App/Models/User').create({
      first_name: 'administrator',
      last_name: 'administrator',
      username: 'administrator',
      password: 'admin',
      is_active: 1,
    });

    await user.roles().attach([USER_ROLES.ADMINISTRATION, USER_ROLES.PRODUCTION, USER_ROLES.SALES, USER_ROLES.HR]);
  }

  down () {
  }
}

module.exports = UsersSchema
