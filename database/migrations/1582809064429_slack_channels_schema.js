'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class SlackChannelsSchema extends Schema {
  up() {
    this.create('slack_channels', table => {
      table.string('id').notNullable().primary();
      table.string('channel_name');
      table.timestamps();
    });
  }

  down() {
    this.drop('slack_channels');
  }
}

module.exports = SlackChannelsSchema;
