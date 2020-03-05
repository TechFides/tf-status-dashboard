'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserProjectParticipationsSchema extends Schema {
  up () {
    this.alter('user_project_participations', (table) => {
      table.dropForeign('project_exp_modifier_id', 'user_project_participations_project_exp_modifiers_id_fk');
      table.dropColumn('project_exp_modifier_id');
    })
  }

  down () {
    this.alter('user_project_participations', (table) => {
      table.string('project_exp_modifier_id').notNullable();
      table.foreign('project_exp_modifier_id').references('project_exp_modifier');
    })
  }
}

module.exports = UserProjectParticipationsSchema
