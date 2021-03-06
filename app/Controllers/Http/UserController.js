'use strict';

const moment = require('moment');
const axios = require('axios');

const UserModel = use('App/Models/User');
const AbsenceApproverModel = use('App/Models/AbsenceApprover');

class UserController {
  static async createUser(data) {
    const user = {
      email: data.workEmail,
      first_name: data.firstName,
      last_name: data.lastName,
      is_active: 1,
      position_id: data.position.id,
    };
    await UserModel.create(user);
  }

  static async deleteUser(id) {
    const user = await UserModel.find(id);

    await user.delete();
    await AbsenceApproverModel.query().where('approver_id', id).orWhere('user_id', id).delete();
  }

  static async editUser(user, data) {
    const userData = {
      email: data.workEmail,
      first_name: data.firstName,
      last_name: data.lastName,
      is_active: 1,
      position_id: data.position.id,
    };

    user.merge(userData);
    await user.save();
  }

  async userSynchronization({ response }) {
    const employeesResponse = await axios({
      url: '/api/employees',
      baseURL: process.env.NUXT_ENV_TF_ERP_API_URL,
      headers: {
        apitoken: process.env.NUXT_ENV_TF_ERP_API_TOKEN,
        Authorization: '',
      },
    });
    const employeesData = employeesResponse.data.data;

    try {
      for (const employee of employeesData) {
        const user = await UserModel.findBy('email', employee.workEmail);
        if (!user && employee.active) {
          await UserController.createUser(employee);
        } else if (user && !employee.active && !user.is_admin) {
          await UserController.deleteUser(user.id);
        } else if (user && moment(employee._updated).isAfter(moment(user.updated_at))) {
          await UserController.editUser(user, employee);
        }
      }
    } catch (e) {
      response.status(500).send({ message: e.message });
    }
  }

  async setAdmin({ request, response, params }) {
    const { id } = params;
    const { isAdmin } = request.body;

    try {
      const user = await UserModel.find(id);
      user.is_admin = isAdmin;
      await user.save();
    } catch (e) {
      response.status(500).send({ message: e.message });
    }
  }

  async setApprover({ request, response, params }) {
    const { id } = params;
    const { approverId } = request.body;
    const absenceApproverModel = await AbsenceApproverModel.findBy('user_id', id);

    try {
      if (absenceApproverModel) {
        absenceApproverModel.approver_id = approverId;
        await absenceApproverModel.save();
      } else {
        await AbsenceApproverModel.create({ user_id: id, approver_id: approverId });
      }
    } catch (e) {
      response.status(500).send({ message: e.message });
    }
  }

  async getUsers() {
    const users = (
      await UserModel.query()
        .with('position')
        .with('user', builder => {
          builder.with('approver');
        })
        .orderBy('first_name', 'asc')
        .orderBy('last_name', 'asc')
        .fetch()
    ).toJSON();

    return users;
  }

  async getUsersFeedbacks({ request }) {
    return (await UserModel.query().with('feedback').fetch()).toJSON();
  }
}

module.exports = UserController;
