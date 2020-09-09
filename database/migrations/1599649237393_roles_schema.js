'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database');

class RolesSchema extends Schema {
  async up () {
    await Database.raw('SET FOREIGN_KEY_CHECKS = 0;')
    await Database.truncate('role_user');
    await Database.truncate('roles');

    const enumData = [
      {
        id: 1,
        slug: 'administration',
        name: 'Administration'
      },
      {
        id: 2,
        slug: 'production',
        name: 'Production'
      },
      {
        id: 3,
        slug: 'sales',
        name: 'Sales'
      },
      {
        id: 4,
        slug: 'HR',
        name: 'HR'
      },
    ];

    await use('App/Models/Role').createMany(enumData);
    await Database.raw('SET FOREIGN_KEY_CHECKS = 1;')
  }

  async down () {
    await Database.raw('SET FOREIGN_KEY_CHECKS = 0;')
    await Database.truncate('role_user');
    await Database.truncate('roles');

    const enumData = [
      {
        id: 1,
        slug: 'user',
        name: 'User'
      },
      {
        id: 2,
        slug: 'admin',
        name: 'Administrator'
      },
    ];

    await use('App/Models/Role').createMany(enumData);
    await Database.raw('SET FOREIGN_KEY_CHECKS = 1;')
  }
}

module.exports = RolesSchema
