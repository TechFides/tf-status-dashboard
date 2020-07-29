'use strict';

const UserModel = use('App/Models/User');
const AbsenceApproverModel = use('App/Models/AbsenceApprover');
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
    const users = (await UserModel
      .query()
      .with('roles')
      .with('approvedUser', (builder) => {
        builder
          .with('absenceApprover');
      })
      .fetch()).toJSON();

    return users;
  }

  async createUser ({ request, response }) {
    const { absenceApprover } = request.body;
    const userData = UserController.mapToDbEntity(request);

    if (request.input('password')) {
      userData.password = request.input('password');
    }

    const user = await UserModel.create(userData);
    await this._setRoles(user, request.input('roles'));
    await AbsenceApproverModel.create({approved_user_id: user.id, absence_approver_id: absenceApprover});

    return user.toJSON();
  }

  async editUser ({ request, response, params }) {
    const { id } = params;
    const { absenceApprover } = request.body;
    const user = await UserModel.find(id);
    const absenceApproverModel = await AbsenceApproverModel.findBy('approved_user_id', id);

    user.merge(UserController.mapToDbEntity(request));

    if (request.input('password')) {
      user.password = request.input('password');
    }

    await user.save();
    await this._setRoles(user, request.input('roles'));

    absenceApproverModel.absence_approver_id = absenceApprover;
    await absenceApproverModel.save();

    return user.toJSON();
  }

  async deleteUser ({ request, response, params }) {
    const { id } = params;
    const user = await UserModel.find(id);

    try {
      await user.delete();
      response.send();
    } catch (e) {
      response.status(500).send({message: e.message});
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
