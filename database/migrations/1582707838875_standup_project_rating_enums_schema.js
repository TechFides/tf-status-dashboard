'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StandupProjectRatingEnumsSchema extends Schema {
  up () {
    this.create('standup_project_rating_enums', (table) => {
      table.increments();
      table.string('name');
      table.string('description');
      table.integer('value');
      table.timestamps();
    })
  }

  down () {
    this.drop('standup_project_rating_enums')
  }
}

module.exports = StandupProjectRatingEnumsSchema
