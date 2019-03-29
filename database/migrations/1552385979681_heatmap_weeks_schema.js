'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HeatmapWeeksSchema extends Schema {
  up () {
    this.create('heatmap_weeks', (table) => {
      table.increments();
      table.dateTime('date').notNullable();
      table.timestamps();
    })
  }

  down () {
    this.drop('heatmap_weeks')
  }
}

module.exports = HeatmapWeeksSchema
