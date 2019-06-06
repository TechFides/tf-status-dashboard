'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class SystemParamSchema extends Schema {
  up () {
    this.create('system_params', (table) => {
      table.string('key');
      table.string('value');
      table.integer('type').defaultTo(1);
      table.primary('key');
      table.timestamps();
    });
  }

  down () {
    this.drop('system_params');
  }
}

module.exports = SystemParamSchema;
