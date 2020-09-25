'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class FeedbacksSchema extends Schema {
  up() {
    this.create('feedbacks', table => {
      table.increments();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users');
      table.integer('heatmap_week_id').unsigned().notNullable();
      table.foreign('heatmap_week_id').references('heatmap_weeks');
      table.integer('feedback_enum_id').unsigned().notNullable();
      table.foreign('feedback_enum_id').references('feedback_enums');
      table.timestamps();
    });
  }

  down() {
    this.drop('feedbacks');
  }
}

module.exports = FeedbacksSchema;
