'use strict';
const moment = require('moment');

const CostCategoryModel = use('App/Models/CostCategory');
const PositionModel = use('App/Models/Position');

class CostCategoryController {
  static async createCostCategory (data) {
    const costCategory =  {
      id: data.id,
      name: data.name,
    };
    await CostCategoryModel.create(costCategory);
  }

  static async editCostCategory (hubCostCategory, data) {
    const costCategory =  {
      name: data.name,
    };

    hubCostCategory.merge(costCategory);
    await hubCostCategory.save();
  }

  static async checkDeletedCostCategory (data) {
    const hubCostCategoryList = (await CostCategoryModel
      .query()
      .fetch()).toJSON();

    if (hubCostCategoryList.length !== data.length) {
      for (const hubCostCategory of hubCostCategoryList) {
        const findCostCategory = data.find(d => d.id === hubCostCategory.id);
        if (!findCostCategory) {
          const costCategory = await CostCategoryModel.find(hubCostCategory.id);
          await costCategory.delete();
        }
      }
    }
  }

  async getCostCategories ({ request, response, params }) {
    const { positionId } = request.get();

    const position = (await PositionModel
      .query()
      .with('costCategories')
      .where('id', positionId)
      .orderBy('name', 'asc')
      .first()).toJSON();

    return position.costCategories;
  }

  async costCategorySynchronization ({ request, response, params }) {
    const { costCategoriesData } = request.body;
    await CostCategoryController.checkDeletedCostCategory(costCategoriesData);

    for (const costCategory of costCategoriesData) {
      const hubCostCategory = await CostCategoryModel.find(costCategory.id);
      if (!hubCostCategory) {
        await CostCategoryController.createCostCategory(costCategory);
      } else if (hubCostCategory && moment(costCategory._updated).isAfter(moment(hubCostCategory.updated_at))) {
        await CostCategoryController.editCostCategory(hubCostCategory, costCategory);
      }
    }
  }
}

module.exports = CostCategoryController;
