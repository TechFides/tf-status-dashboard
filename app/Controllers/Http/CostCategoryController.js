'use strict';
const moment = require('moment');

const CostCategoryModel = use('App/Models/CostCategory');

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

  async costCategorySynchronization ({ request, response, params }) {
    const costCategoryData = request.body;
    await CostCategoryController.checkDeletedPositions(costCategoryData);

    for (const costCategory of costCategoryData) {
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
