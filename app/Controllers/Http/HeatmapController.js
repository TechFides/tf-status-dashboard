'use strict';

const HeatmapModel = use('App/Models/HeatmapWeek');

class HeatmapController {
  async getHeatmapWeeks({ request }) {
    let { month, year } = request.get();
    month = Number(month);
    year = Number(year);
    const lastMonth = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month + 1, 1);

    const weeks = await HeatmapModel.query().where('date', '>=', lastMonth).where('date', '<', nextMonth).fetch();

    return weeks.toJSON();
  }
}

module.exports = HeatmapController;
