'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class NewPermissionsSchema extends Schema {
  up() {
    this.raw("INSERT INTO permissions (name, value) VALUES ('Manage project notes', 'manage-project-notes')");
    this.raw("INSERT INTO permissions (name, value) VALUES ('Manage sitdowns', 'manage-sitdowns')");
  }

  down() {
    this.raw("DELETE FROM permissions WHERE value = 'manage-project-notes'");
    this.raw("DELETE FROM permissions WHERE value = 'manage-sitdowns'");

    this.raw(
      "DELETE FROM position_permissions WHERE permission_id IN (SELECT permission.id FROM permissions WHERE value = 'manage-project-notes')",
    );
    this.raw(
      "DELETE FROM position_permissions WHERE permission_id IN (SELECT permission.id FROM permissions WHERE value = 'manage-sitdowns')",
    );
  }
}

module.exports = NewPermissionsSchema;
