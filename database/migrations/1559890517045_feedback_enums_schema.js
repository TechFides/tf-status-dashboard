'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');
const FeedbackEnumModel = use('App/Models/FeedbackEnum');

class FeedbackEnumsSchema extends Schema {
  async up () {
    const feedbackEnum = await FeedbackEnumModel.find(4);
    feedbackEnum.description = 'HORRIBLE';
    await feedbackEnum.save();
  }

  async down () {
    const feedbackEnum = await FeedbackEnumModel.find(4);
    feedbackEnum.description = 'HORIBLE';
    await feedbackEnum.save();
  }
}

module.exports = FeedbackEnumsSchema;
