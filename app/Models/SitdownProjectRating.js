'use strict';

const Model = use('Model');

class SitdownProjectRating extends Model {
  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  project() {
    return this.belongsTo('App/Models/Project');
  }

  projectRating() {
    return this.belongsTo('App/Models/SitdownProjectRatingEnum');
  }

  sitdown() {
    return this.belongsTo('App/Models/Sitdown');
  }
}

module.exports = SitdownProjectRating;
