'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');
const Database = use('Database');

class PermissionsSchema extends Schema {
  async up() {
    await Database.raw('SET FOREIGN_KEY_CHECKS = 0;');
    await use('App/Models/Permission').truncate();

    const enumData = [
      {
        id: 1,
        name: 'Dashboard',
        value: 'dashboard',
      },
      {
        id: 2,
        name: 'Standup',
        value: 'standup',
      },
      {
        id: 3,
        name: 'Projekty',
        value: 'projects',
      },
      {
        id: 4,
        name: 'Nepřítomnosti',
        value: 'office-absences',
      },
      {
        id: 5,
        name: 'The Game',
        value: 'statistics',
      },
      {
        id: 6,
        name: 'Logování práce',
        value: 'work-logs',
      },
      {
        id: 7,
        name: 'Uživatelé',
        value: 'users',
      },
      {
        id: 8,
        name: 'Pozice',
        value: 'position',
      },
      {
        id: 9,
        name: 'Heatmap',
        value: 'heatmap',
      },
      {
        id: 10,
        name: 'Časy konání sitdownu',
        value: 'meeting-times',
      },
      {
        id: 11,
        name: 'Nastavení',
        value: 'settings',
      },
    ];

    await use('App/Models/Permission').createMany(enumData);
    await Database.raw('SET FOREIGN_KEY_CHECKS = 1;');
  }

  down() {}
}

module.exports = PermissionsSchema;
