'use strict';

const WorkLogModel = use('App/Models/WorkLog');

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
      cost_category: costCategory,
    };
  }

  async getWorkLogList ({ request, response, params }) {
    const { startDate, endDate, authorId, costCategoryId } = request.get();
    const WorkLogModelQuery = WorkLogModel
      .query()
      .with('user')
      .whereBetween('started',[startDate, endDate]);

    if (authorId) {
      WorkLogModelQuery.where('author_id', authorId);
    }

    if (costCategoryId) {
      WorkLogModelQuery.where('cost_category_id', costCategoryId);
    }

    const workLogsList = (await WorkLogModelQuery.fetch()).toJSON();

    return workLogsList;
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
