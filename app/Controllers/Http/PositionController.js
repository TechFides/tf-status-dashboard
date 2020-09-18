'use strict';
const moment = require('moment');

const PositionModel = use('App/Models/Position');
const PositionPermissionModel = use('App/Models/PositionPermission');
const PositionCostCategory = use('App/Models/PositionCostCategory');

class PositionController {
  static async createPosition (data) {
    const position =  {
      id: data.id,
      name: data.name,
    };
    await PositionModel.create(position);
  }

  static async editPosition (hubPosition, data) {
    const position =  {
      name: data.name,
    };

    hubPosition.merge(position);
    await hubPosition.save();
  }

  async getPositions ({ request, response, params }) {
    return (await PositionModel
      .query()
      .with('permissions')
      .with('costCategories')
      .orderBy('name', 'asc')
      .fetch()).toJSON();
  }

  static async checkDeletedPositions (data) {
    const hubPositionList = (await PositionModel
      .query()
      .fetch()).toJSON();

    if (hubPositionList.length !== data.length) {
      for (const hubPosition of hubPositionList) {
        const findPosition = data.find(d => d.id === hubPosition.id);
        if (!findPosition) {
          const position = await PositionModel.find(hubPosition.id);
          await position.delete();
        }
      }
    }
  }

  static async setCostCategories (positionData) {
    await PositionCostCategory
      .query()
      .where('position_id', '=', positionData.id)
      .delete();

    const payload = positionData.costCategories.map(c => ({
      position_id: positionData.id,
      cost_category_id: c.id,
    }));

    await PositionCostCategory.createMany(payload);
  }

  async positionSynchronization ({ request, response, params }) {
    const positionsData = request.body;
    await PositionController.checkDeletedPositions(positionsData);

    for (const position of positionsData) {
      const hubPosition = await PositionModel.find(position.id);
      if (!hubPosition) {
        await PositionController.createPosition(position);
      } else if (hubPosition && moment(position._updated).isAfter(moment(hubPosition.updated_at))) {
        await PositionController.editPosition(hubPosition, position);
      }
      await PositionController.setCostCategories(position);
    }
  }

  async setPermissions ({ request, response, params }) {
    const { id } = params;
    const permissionIds = request.body;

    try {
      await PositionPermissionModel
        .query()
        .where('position_id', '=', id)
        .delete();

      const payload = permissionIds.map(p => ({
        position_id: id,
        permission_id: p,
      }));

      await PositionPermissionModel.createMany(payload);
    } catch (e) {
      response.status(500).send({message: e.message});
    }
  }

  async setFeedback ({ request, response, params }) {
    const { id } = params;
    const { sendFeedback } = request.body;

    try {
      const position = await PositionModel.find(id);
      position.send_feedback = sendFeedback;
      await position.save();
    } catch (e) {
      response.status(500).send({message: e.message});
    }
  }

  async setPlayer ({ request, response, params }) {
    const { id } = params;
    const { isPlayer } = request.body;

    try {
      const position = await PositionModel.find(id);
      position.is_player = isPlayer;
      await position.save();
    } catch (e) {
      response.status(500).send({message: e.message});
    }
  }
}

module.exports = PositionController;
