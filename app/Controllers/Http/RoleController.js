'use strict';

const RoleModel = use('Adonis/Acl/Role');

class RoleController {
  static mapToDbEntity (request) {
    const {
      slug,
      name,
      description,
    } = request.only(['slug', 'name', 'description']);

    return {
      slug,
      name,
      description,
    };
  }

  async getRoles ({ request, response, params }) {
    const roles = await RoleModel
      .query()
      .fetch();

    return roles.toJSON();
  }
}

module.exports = RoleController;
