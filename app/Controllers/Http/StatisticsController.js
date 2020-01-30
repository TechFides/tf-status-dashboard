'use strict';

const UserModel = use('App/Models/User');

class StatisticsController {
  async getProjectStatistics ({ request, response, params }) {
    let { month, year } = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month, 1);
    const nextMonth = new Date(year, month + 1, 1);

    const userStatistics = (await UserModel
      .query()
      .where('is_active', true)
      .with('projectParticipations', (builder) => {
        builder
          .where('date', '>=', currentMonth)
          .where('date', '<', nextMonth)
          .with('project', (builder) => {
            builder
              .with('standupProjectRating', (builder) => {
                builder
                  .whereHas('standup', (builder) => {
                    builder
                      .where('date', '>=', currentMonth)
                      .where('date', '<', nextMonth);
                  })
                  .with('projectRating')
                  .with('standup')
              });
          })
      })
      .fetch()).toJSON();

    return userStatistics;
  }
}

module.exports = StatisticsController;
