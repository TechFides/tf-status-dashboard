'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProjectUsersSchema extends Schema {
  up() {
    this.create('project_users', table => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users');
      table.integer('project_id').unsigned().notNullable();
      table.foreign('project_id').references('projects');
      table.integer('project_exp_modifier_id').unsigned().notNullable();
      table.foreign('project_exp_modifier_id').references('project_exp_modifiers');
      table.timestamps();
    });
  }

  down() {
    this.drop('project_users');
  }
}

module.exports = ProjectUsersSchema;
