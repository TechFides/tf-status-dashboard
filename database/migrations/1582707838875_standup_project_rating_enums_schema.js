'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StandupProjectRatingEnumsSchema extends Schema {
  async up () {
    const enumData = [
      {
        id: 6,
        name: 'STANDARD_v2',
        description: 'Average',
        value: 50,
      },
      {
        id: 7,
        name: 'GOOD_v2',
        description: 'Doing better than expected',
        value: 80,
      },
      {
        id: 8,
        name: 'DEFAULT',
        description: 'Default value',
        value: 0,
      },
    ];

    await use('App/Models/StandupProjectRatingEnum').createMany(enumData);
  }

  async down () {
  }
}

module.exports = StandupProjectRatingEnumsSchema
