'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FeedbackEnumsSchema extends Schema {
  up () {
    this.create('feedback_enums', (table) => {
      table.increments();
      table.string('description').notNullable();
      table.timestamps();
    })
  }

  down () {
    this.drop('feedback_enums')
  }
}

module.exports = FeedbackEnumsSchema
