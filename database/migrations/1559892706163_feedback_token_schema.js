'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class FeedbackTokenSchema extends Schema {
  up () {
    this.create('feedback_tokens', (table) => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users');
      table.integer('heatmap_week_id').unsigned().notNullable();
      table.foreign('heatmap_week_id').references('heatmap_weeks');
      table.string('token').notNullable();
      table.boolean('expired').notNullable().defaultTo(false);
      table.timestamps();
    });
  }

  down () {
    this.drop('feedback_tokens');
  }
}

module.exports = FeedbackTokenSchema;
