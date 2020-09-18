'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoleUserSchema extends Schema {
  up () {
    this.drop('role_user')
  }

  down () {
    this.create('role_user', (table) => {
      table.increments();
      table.integer('role_id').unsigned().index();
      table.foreign('role_id').references('id').on('roles').onDelete('cascade');
      table.integer('user_id').unsigned().index();
      table.foreign('user_id').references('id').on('users').onDelete('cascade');
      table.timestamps();
    });
  }
}

module.exports = RoleUserSchema
