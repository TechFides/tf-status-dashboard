'use strict';

const Model = use('Model');

class HeatmapWeek extends Model {
  static get dates () {
    return super.dates.concat(['date']);
  }

  static get hidden () {
    return ['created_at', 'updated_at'];
  }
}

module.exports = HeatmapWeek;
