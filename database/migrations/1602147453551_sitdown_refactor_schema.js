'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class SitdownRefactorSchema extends Schema {
  async up() {
    this.raw('ALTER TABLE standup_project_ratings CHANGE standup_id sitdown_id INT(10) UNSIGNED;');
    this.raw(
      'ALTER TABLE standup_project_ratings CHANGE standup_project_rating_enum_id sitdown_project_rating_enum_id INT(10) UNSIGNED;',
    );

    await this.rename('standups', 'sitdowns');
    await this.rename('standup_project_ratings', 'sitdown_project_ratings');
    await this.rename('standup_project_rating_enums', 'sitdown_project_rating_enums');
  }

  async down() {
    await this.rename('sitdowns', 'standups');
    await this.rename('sitdown_project_ratings', 'standup_project_ratings');
    await this.rename('sitdown_project_rating_enums', 'standup_project_rating_enums');

    this.raw('ALTER TABLE standup_project_ratings CHANGE sitdown_id standup_id INT(10) UNSIGNED;');
    this.raw(
      'ALTER TABLE standup_project_ratings CHANGE sitdown_project_rating_enum_id standup_project_rating_enum_id INT(10) UNSIGNED;',
    );
  }
}

module.exports = SitdownRefactorSchema;
