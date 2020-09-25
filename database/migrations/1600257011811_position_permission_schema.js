'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class PositionPermissionSchema extends Schema {
  up() {
    this.create('position_permissions', table => {
      table.increments();
      table.integer('position_id').unsigned().index();
      table.foreign('position_id').references('positions');
      table.integer('permission_id').unsigned().index();
      table.foreign('permission_id').references('permissions');
      table.timestamps();
    });
  }

  down() {
    this.drop('position_permissions');
  }
}

module.exports = PositionPermissionSchema;
