'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SystemParamSchema extends Schema {
  async up () {
    const enumData = [
      {
        key: 'slackErrorChannel',
        value: 'slackbot-errors',
        type: 1,
      },
      {
        key: 'slackSchedulerChannel',
        value: '_general',
        type: 1,
      },
    ];

    await use('App/Models/SystemParam').createMany(enumData);
  }

  async down () {
  }
}

module.exports = SystemParamSchema
