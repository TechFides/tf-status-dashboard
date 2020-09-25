'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class RoleSchema extends Schema {
  up() {
    this.drop('roles');
  }

  down() {
    this.create('roles', table => {
      table.increments();
      table.string('slug').notNullable().unique();
      table.string('name').notNullable().unique();
      table.text('description').nullable();
      table.timestamps();
    });
  }
}

module.exports = RoleSchema;
