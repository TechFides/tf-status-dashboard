'use strict';

const UserModel = use('App/Models/User');
const AbsenceApproverModel = use('App/Models/AbsenceApprover');
const RoleModel = use('Adonis/Acl/Role');
const WorkLogModel = use('App/Models/WorkLog');

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
      .with('user', (builder) => {
        builder
          .with('approver');
      })
      .orderBy('first_name', 'asc')
      .orderBy('last_name', 'asc')
      .fetch()).toJSON();

    return users;
  }

  async createUser ({ request, response }) {
    const { absenceApproverId } = request.body;
    const userData = UserController.mapToDbEntity(request);

    if (!request.input('password')) {
      response.status(422).send({ message: 'Unprocessable entity' });
      return;

    }
    userData.password = request.input('password');

    const user = await UserModel.create(userData);
    await this._setRoles(user, request.input('roles'));

    if (absenceApproverId) {
      await AbsenceApproverModel.create({user_id: user.id, approver_id: absenceApproverId});
    }

    return user.toJSON();
  }

  async editUser ({ request, response, params }) {
    const { id } = params;
    const { absenceApproverId } = request.body;
    const user = await UserModel.find(id);
    const absenceApproverModel = await AbsenceApproverModel.findBy('user_id', id);

    user.merge(UserController.mapToDbEntity(request));

    if (request.input('password')) {
      user.password = request.input('password');
    }

    await user.save();
    await this._setRoles(user, request.input('roles'));

    if (absenceApproverModel) {
      absenceApproverModel.approver_id = absenceApproverId;
      await absenceApproverModel.save();
    } else {
      await AbsenceApproverModel.create({user_id: id, approver_id: absenceApproverId});
    }

    return user.toJSON();
  }

  async deleteUser ({ request, response, params }) {
    const { id } = params;
    const user = await UserModel.find(id);

    try {
      await user.delete();
      await AbsenceApproverModel
        .query()
        .where('approver_id', id)
        .orWhere('user_id', id)
        .delete();

      await WorkLogModel
        .query()
        .where('user_id', id)
        .delete();

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
