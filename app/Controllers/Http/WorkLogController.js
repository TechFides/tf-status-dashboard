'use strict';

const WorkLogModel = use('App/Models/WorkLog');
const UserModel = use('App/Models/User');
const CostCategoryModel = use('App/Models/CostCategory');

class WorkLogController {
  static mapToDbEntity (request) {
    const {
      authorId,
      started,
      timeSpent,
      description,
      costCategory,
    } = request.only(['authorId', 'started', 'timeSpent', 'description', 'costCategory']);

    return {
      user_id: authorId,
      started,
      time_spent: timeSpent,
      description,
      cost_category_id: costCategory.id,
    };
  }

  async getWorkLogList ({ request, response, params }) {
    const { startDate, endDate, authorId, costCategoryId, loggedInUserId } = request.get();
    const user = (await UserModel
      .query()
      .with('roles')
      .first()).toJSON();
    const isUserRoleAdmin = user.roles.find(r => r.slug === 'administration');

    const WorkLogModelQuery = WorkLogModel
      .query()
      .with('user')
      .with('costCategory')
      .whereBetween('started',[startDate, endDate]);

    if (!isUserRoleAdmin) {
      WorkLogModelQuery.where('user_id', loggedInUserId);
    }

    if (authorId) {
      WorkLogModelQuery.where('user_id', authorId);
    }

    if (costCategoryId) {
      WorkLogModelQuery.where('cost_category_id', costCategoryId);
    }

    const workLogsList = (await WorkLogModelQuery.orderBy('started', 'desc').fetch()).toJSON();

    let timeSpentSum = 0;
    for (const workLogs of workLogsList) {
      timeSpentSum += workLogs.time_spent;
    }

    return { items: workLogsList, timeSpentSum: timeSpentSum};
  }

  async createWorkLog ({ request, response, params }) {
    const workLog = new WorkLogModel();
    workLog.fill(WorkLogController.mapToDbEntity(request));
    await workLog.save();

    return workLog.toJSON();
  }

  async editWorkLog ({ request, response, params }) {
    const { id } = params;
    const workLog = await WorkLogModel.find(id);

    workLog.merge(WorkLogController.mapToDbEntity(request));
    await workLog.save();

    return workLog.toJSON();
  }

  async deleteWorkLog ({ request, response, params }) {
    const { id } = params;
    const workLog = await WorkLogModel.find(id);

    try {
      await workLog.delete();
      response.send();
    } catch (e) {
      response.status(500).send({message: e.message});
    }
  }
}

module.exports = WorkLogController;
