'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');
const SystemParamModel = use('App/Models/SystemParam');

class SystemParamSchema extends Schema {
  async up () {
    const feedbackCrontab = {
      key: 'feedbackCrontab',
      value: '30 9 * * 5', // FRIDAY at 9:30
      type: 1,
    };

    await SystemParamModel.create(feedbackCrontab);
  }

  async down () {
    await SystemParamModel.truncate();
  }
}

module.exports = SystemParamSchema;
