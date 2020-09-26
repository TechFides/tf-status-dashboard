'use strict';
const moment = require('moment');
const axios = require('axios');

const CostCategoryModel = use('App/Models/CostCategory');
const PositionModel = use('App/Models/Position');

const formatCostCategories = costCategories => {
  let flattenArray = [];
  for (const category of costCategories) {
    if (category.subCategories.length) {
      for (const subCategorie of category.subCategories) {
        flattenArray.push({
          workCategory: subCategorie.workCategory,
          name: `${category.name} -> ${subCategorie.name}`,
          id: subCategorie.id,
        });
      }
    } else {
      flattenArray.push({
        workCategory: category.workCategory,
        name: category.name,
        id: category.id,
      });
    }
  }

  return flattenArray.filter(f => f.workCategory);
};

class CostCategoryController {
  static async createCostCategory(data) {
    const costCategory = {
      id: data.id,
      name: data.name,
    };
    await CostCategoryModel.create(costCategory);
  }

  static async editCostCategory(hubCostCategory, data) {
    const costCategory = {
      name: data.name,
    };

    hubCostCategory.merge(costCategory);
    await hubCostCategory.save();
  }

  static async checkDeletedCostCategory(data) {
    const hubCostCategoryList = (await CostCategoryModel.query().fetch()).toJSON();

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

  static async costCategorySynchronization() {
    const costCategories = await axios({
      url: '/api/cost-categories/tree',
      baseURL: process.env.NUXT_ENV_TF_ERP_API_URL,
      headers: {
        apitoken: process.env.NUXT_ENV_TF_ERP_API_TOKEN,
        Authorization: '',
      },
    });

    const costCategoriesData = formatCostCategories(costCategories.data.data);

    for (const costCategory of costCategoriesData) {
      const hubCostCategory = await CostCategoryModel.find(costCategory.id);
      if (!hubCostCategory) {
        await CostCategoryController.createCostCategory(costCategory);
      } else {
        await CostCategoryController.editCostCategory(hubCostCategory, costCategory);
      }
    }
  }

  async getCostCategories({ request, response, params }) {
    const { positionId } = request.get();

    if (positionId) {
      const position = (
        await PositionModel.query().with('costCategories').where('id', positionId).orderBy('name', 'asc').first()
      ).toJSON();

      return position.costCategories;
    } else {
      return [];
    }
  }
}

module.exports = CostCategoryController;
