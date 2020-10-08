'use strict';

const SitdownModel = use('App/Models/Sitdown');
const SitdownProjectRating = use('App/Models/SitdownProjectRating');

class SitdownController {
  static getSitdownData(request) {
    const { date } = request.only(['sitdownDate']);

    return {
      date,
    };
  }

  async getSitdowns({ request, response, session }) {
    let { month, year } = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month, 1);
    const nextMonth = new Date(year, month + 1, 1);

    const sitdowns = await SitdownModel.query().where('date', '>=', currentMonth).where('date', '<', nextMonth).fetch();

    return sitdowns.toJSON();
  }

  async createSitdown({ request, response, params }) {
    const sitdown = new SitdownModel();
    const date = request.only(['date']);

    sitdown.fill(date);
    await sitdown.save();

    return sitdown.toJSON();
  }

  async editSitdown({ request, response, params }) {
    const { id } = params;
    const { date } = request.only(['date']);
    await SitdownModel.query().where('id', '=', id).update({ date: date });
  }

  async deleteSitdown({ request, response, params }) {
    const { id } = params;
    const sitdown = await SitdownModel.find(id);

    try {
      await SitdownProjectRating.query().where('sitdown_id', '=', id).delete();

      await sitdown.delete();
      response.send();
    } catch (e) {
      response.status(500).send({ message: e.message });
    }
  }
}

module.exports = SitdownController;
