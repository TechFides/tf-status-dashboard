'use strict';

const { SYSTEM_PARAMS } = require('../../../constants');

const SystemParamModel = use('App/Models/SystemParam');
const FeedbackSchedulerService = use('App/Services/FeedbackScheduler');

const FEEDBACK_CRONTAB_REGEX = /(^[0-5]?[0-9]|\*) ([0-1]?[0-9]|[2][0-3]|\*) ([0-2]?[0-9]|[3][0-1]|\*) ([0]?[1-9]|[1][0-2]|\*) ([0-7]|\*)$/;

class SystemParamsController {
  static mapToDbEntities (request) {
    const body = request.post();
    return Object.keys(body).map((key) => {
      const value = body[key];

      let type;
      if (typeof value === 'string') {
        type = 1;
      }
      // TODO: add more types when needed

      return { key, value, type };
    });
  }

  static mapFromDbEntity (entities) {
    const collection = entities.toJSON() || [];
    // TODO: add parsing for different types when needed
    return collection.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), Object.create(null));
  }

  static validateSystemParams (request) {
    const body = request.post();
    return Object.keys(body).reduce((errors, key) => {
      if (key === SYSTEM_PARAMS.FEEDBACK_CRONTAB) {
        const valid = FEEDBACK_CRONTAB_REGEX.test(body[key]);
        if (!valid) {
          return [...errors, 'Invalid feedbackCrontab. Feedback crontab must have the following format: "minutes" "hours" "day of month" "month" "day of week"'];
        }
      }
      return errors;
    }, []);
  }

  async getSystemParams () {
    const systemParams = await SystemParamModel.query().fetch();
    return SystemParamsController.mapFromDbEntity(systemParams);
  }

  async setSystemParams ({ request, response }) {
    const errors = SystemParamsController.validateSystemParams(request);

    if (errors.length > 0) {
      return response.status(400).send({ errors });
    }

    const systemParams = SystemParamsController.mapToDbEntities(request);
    systemParams.forEach(async (systemParam) => {
      const instance = await SystemParamModel.findOrNew({ key: systemParam.key }, systemParam);
      instance.merge(systemParam);
      await instance.save();

      if (systemParam.key === SYSTEM_PARAMS.FEEDBACK_CRONTAB) {
        FeedbackSchedulerService.schedule();
      }
    });
    return response.send();
  }
}

module.exports = SystemParamsController;
