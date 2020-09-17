'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PositionPermissionSchema extends Schema {
  up () {
    this.create('position_permissions', (table) => {
      table.increments()
      table.integer('position_id').unsigned().index();
      table.foreign('position_id').references('id').on('positions').onDelete('cascade');
      table.integer('permission_id').unsigned().index();
      table.foreign('permission_id').references('id').on('permissions').onDelete('cascade');
      table.timestamps()
    })
  }

  down () {
    this.drop('position_permissions')
  }
}

module.exports = PositionPermissionSchema
