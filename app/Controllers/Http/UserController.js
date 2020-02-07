'use strict';

const UserModel = use('App/Models/User');
const RoleModel = use('Adonis/Acl/Role');

class UserController {
  static mapToDbEntity (request) {
    const {
      firstName,
      lastName,
      isActive,
      username,
      email,
      sendFeedback,
    } = request.only(['firstName', 'lastName', 'isActive', 'username', 'email', 'sendFeedback']);

    return {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      is_active: isActive,
      send_feedback: sendFeedback,
    };
  }

  async getUsers () {
    const users = await UserModel
      .query()
      .with('roles')
      .fetch();

    return users.toJSON();
  }

  async createUser ({ request, response }) {
    const user = new UserModel();
    user.fill(UserController.mapToDbEntity(request));

    if (!request.input('password')) {
      response.status(422).send({ message: 'Unprocessable entity' });
      return;
    }

    user.password = request.input('password');

    await user.save();
    await this._setRoles(user, request.input('roles'));

    return user.toJSON();
  }

  async editUser ({ request, response, params }) {
    const { id } = params;
    const user = await UserModel.find(id);
    user.merge(UserController.mapToDbEntity(request));

    if (request.input('password')) {
      user.password = request.input('password');
    }

    await user.save();
    await this._setRoles(user, request.input('roles'));

    return user.toJSON();
  }

  async deleteUser ({ request, response, params }) {
    const { id } = params;
    const user = await UserModel.find(id);

    try {
      await user.delete();
      response.send();
    } catch (e) {
      return e.toJSON();
    }
  }

  async _setRoles (user, roles) {
    const attachedRoles = await user.getRoles();

    const toAttach = roles
      .filter(slug => roles.includes(slug))
      .map(slug => RoleModel.findBy('slug', slug));

    const toDetach = attachedRoles
      .filter(slug => !roles.includes(slug))
      .map(slug => RoleModel.findBy('slug', slug));

    const rolesToAttach = await Promise.all(toAttach);
    const rolesToDetach = await Promise.all(toDetach);

    const attach = rolesToAttach.map(role => role.id);
    const detach = rolesToDetach.map(role => role.id);

    return Promise.all([
      user.roles().attach(attach),
      user.roles().detach(detach),
    ]);
  }

  async getUsersFeedbacks ({ request }) {
    const { isActive } = request.get();
    const query = UserModel.query().with('feedback');

    if (isActive === 'true') {
      query.where('is_active', true);
    }

    return (await query.fetch()).toJSON();
  }
}

module.exports = UserController;
