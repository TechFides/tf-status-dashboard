'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class NewPermissionsSchema extends Schema {
  up() {
    this.raw("INSERT INTO permissions (name, value) VALUES ('Sitdown rating', 'sitdown-rating')");
    this.raw("INSERT INTO permissions (name, value) VALUES ('Manage the Game', 'manage-game')");
  }

  down() {
    this.raw("DELETE FROM permissions WHERE value = 'sitdown-rating'");
    this.raw("DELETE FROM permissions WHERE value = 'manage-game'");

    this.raw(
      "DELETE FROM position_permissions WHERE permission_id IN (SELECT permission.id FROM permissions WHERE value = 'sitdown-rating')",
    );
    this.raw(
      "DELETE FROM position_permissions WHERE permission_id IN (SELECT permission.id FROM permissions WHERE value = 'manage-game')",
    );
  }
}

module.exports = NewPermissionsSchema;
