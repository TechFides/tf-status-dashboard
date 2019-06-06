'use strict';

const StandupModel = use('App/Models/Standup');
const StandupProjectRating = use('App/Models/StandupProjectRating');

class StandupController {
  static getStandupData (request) {
    const { date } = request.only(['standupDate']);

    return {
      date,
    };
  }

  async getStandups ({ request, response, session }) {
    let { month, year } = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month, 1);
    const nextMonth = new Date(year, month + 1, 1);

    const standups = await StandupModel
      .query()
      .where('date', '>=', currentMonth)
      .where('date', '<', nextMonth)
      .fetch();

    return standups.toJSON();
  }

  async createStandup ({ request, response, params }) {
    const standup = new StandupModel();
    const date = request.only(['date']);

    standup.fill(date);
    await standup.save();

    return standup.toJSON();
  }

  async editStandup ({ request, response, params }) {
    const { id } = params;
    const { date } = request.only(['date']);
    await StandupModel
      .query()
      .where('id', '=', id)
      .update({ date: date });
  }

  async deleteStandup ({ request, response, params }) {
    const { id } = params;
    const standup = await StandupModel.find(id);

    try {
      await StandupProjectRating
        .query()
        .where('standup_id', '=', id)
        .delete();

      await standup.delete();
      response.send();
    } catch (e) {
      return e.toJSON();
    }
  }
}

module.exports = StandupController;
