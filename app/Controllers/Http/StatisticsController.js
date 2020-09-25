'use strict';

const UsersXpCounter = use('App/Services/UsersXpCounter');
const BonusExpModel = use('App/Models/BonusExp');

class StatisticsController {
  async getProjectStatistics({ request, response, params }) {
    let { month, year } = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month, 1);

    return UsersXpCounter.countUsersXp(currentMonth, nextMonth);
  }

  async addUserBonusXp({ request, response, params }) {
    const { id, date, totalXp, bonusXp } = request.only(['id', 'date', 'totalXp', 'bonusXp']);
    const currentMonth = new Date(Number(date.year), Number(date.month) - 1, 1);
    const nextMonth = new Date(Number(date.year), Number(date.month), 1);

    const userBonusExp = await BonusExpModel.query()
      .where('date', '>=', currentMonth)
      .where('date', '<', nextMonth)
      .where('user_id', '=', id)
      .fetch();

    if (userBonusExp.rows.length > 0) {
      await BonusExpModel.query()
        .where('date', '>=', currentMonth)
        .where('date', '<', nextMonth)
        .where('user_id', '=', id)
        .update({ exp: bonusXp });
    } else {
      await BonusExpModel.create({
        user_id: id,
        exp: bonusXp,
        date: currentMonth,
        description: '',
      });
    }

    const user = [{ id: id, totalXp: totalXp }];
    await UsersXpCounter.setUserExperience(currentMonth, nextMonth, user);
  }
}

module.exports = StatisticsController;
