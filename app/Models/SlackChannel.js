'use strict';

const Model = use('Model');

class SlackChannel extends Model {
  static get hidden () {
    return ['created_at', 'updated_at'];
  }

  project () {
    return this.hasOne('App/Models/Project');
  }
}

module.exports = SlackChannel;
