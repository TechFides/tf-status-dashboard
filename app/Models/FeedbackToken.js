'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class FeedbackToken extends Model {
  user() {
    return this.belongsTo('App/Models/User');
  }

  heatmapWeek() {
    return this.belongsTo('App/Models/HeatmapWeek');
  }
}

module.exports = FeedbackToken;
