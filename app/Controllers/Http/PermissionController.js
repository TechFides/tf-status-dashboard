'use strict';
const PermissionModel = use('App/Models/Permission');

class PermissionController {
  async getPermissions({ request, response, params }) {
    return (await PermissionModel.query().orderBy('name', 'asc').fetch()).toJSON();
  }
}

module.exports = PermissionController;
