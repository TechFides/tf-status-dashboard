'use strict';

const UserModel = use('App/Models/User');
const RoleModel = use('Adonis/Acl/Role');
const FModel = use('App/Models/Feedback');

class UserController {
  static mapToDbEntity (request) {
    const {
      firstName,
      lastName,
      isActive,
      totalExp,
      username,
    } = request.only(['firstName', 'lastName', 'isActive', 'totalExp', 'username']);

    return {
      username,
      first_name: firstName,
      last_name: lastName,
      is_active: isActive,
      total_exp: totalExp,
    };
  }

  async getUsers ({ request, response, params }) {
    const users = await UserModel
      .query()
      .with('roles')
      .fetch();

    return users.toJSON();
  }

  async createUser ({ request, response, params }) {
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

  async _setRoles(user, roles) {
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

  async getUsersFeedbacks ({ request, response, params }) {
    let { month, year } = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month, 1);
    const nextMonth = new Date(year, month+1, 1); 

    const query = UserModel
      .query()
      .with('feedback', element => {
        element.where('create_at', '>=', currentMonth)
        element.where('create_at', '<', nextMonth)
      });

    const usersFeedbacks = await query.fetch();

    return usersFeedbacks.toJSON();
  }
}

module.exports = UserController;
