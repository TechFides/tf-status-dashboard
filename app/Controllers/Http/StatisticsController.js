'use strict';

const UsersXpCounter = use('App/Services/UsersXpCounter');
const UserTotalExpModel = use('App/Models/UserTotalExp');
const BonusExp = use('App/Models/BonusExp');

class StatisticsController {

  async getProjectStatistics ({ request, response, params }) {
    let { month, year } = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month, 1);

    return UsersXpCounter.countUsersXp(currentMonth, nextMonth);
  }

  async addUserBonusXp ({ request, response, params }) {
    const { id, date, totalXp,  bonusXp } = request.only(['id', 'date', 'totalXp', 'bonusXp']);
    const d = new Date();
    const month = d.getMonth();
    const year = d.getFullYear();
    const currentMonth = new Date(year, month, 1);
    const nextMonth = new Date(year, month + 1, 1);

    const userBonusExp = await BonusExp
      .query()
      .where('date', '>=', currentMonth)
      .where('date', '<', nextMonth)
      .where('user_id', '=', id)
      .fetch();

    if (userBonusExp.rows.length > 0) {
      await BonusExp
        .query()
        .where('date', '>=', currentMonth)
        .where('date', '<', nextMonth)
        .where('user_id', '=', id)
        .update({ exp: bonusXp })
    } else {
      await BonusExp.create({
        user_id: id,
        exp: bonusXp,
        date: date,
        description: '',
      });
    }

    await UserTotalExpModel
      .query()
      .where('date', '>=', currentMonth)
      .where('date', '<', nextMonth)
      .where('user_id', '=', id)
      .update({ total_exp: totalXp })
  }
}

module.exports = StatisticsController;
