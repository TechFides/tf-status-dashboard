'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');
const Database = use('Database');

class RolesSchema extends Schema {
  static async insertIfDoesntExist (role) {
    return await Database
      .table('roles')
      .select()
      .where('id', role.id)
      .then(async function (rows) {
        if (rows.length === 0) {
          return await Database.table('roles').insert(role);
        } else {
          return false;
        }
      });
  }

  async up () {
    await RolesSchema.insertIfDoesntExist({ id: 1, slug: 'user', name: 'User' });
    await RolesSchema.insertIfDoesntExist({ id: 2, slug: 'admin', name: 'Administrator' });
  }

  async down () {
    await Database.table('roles').where('id', 1).orWhere('id', 2).delete();
  }
}

module.exports = RolesSchema;
