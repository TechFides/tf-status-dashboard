'use strict';

const Model = use('Model');

class Sitdown extends Model {
  static get dates() {
    return super.dates.concat(['date']);
  }

  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  sitdownProjectRating() {
    return this.hasMany('App/Models/SitdownProjectRating');
  }
}

module.exports = Sitdown;
