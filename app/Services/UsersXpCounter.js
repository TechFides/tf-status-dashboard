'use strict';

const UserModel = use('App/Models/User');
const StandupModel = use('App/Models/Standup');
const UserTotalExpModel = use('App/Models/UserTotalExp');

class UsersXpCounter {
  async countUsersXp (currentMonth, nextMonth) {
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() -1, currentMonth.getDate());

    const fetchedUserStatistics = (await UserModel
      .query()
      .where('is_active', true)
      .with('bonusExps', (builder) => {
        builder
          .where('date', '>=', currentMonth)
          .where('date', '<', nextMonth)
      })
      .with('userTotalExp', (builder) => {
        builder
          .where('date', '>=', previousMonth)
          .where('date', '<', nextMonth)
      })
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

    const standups = (await StandupModel
      .query()
      .where('date', '>=', currentMonth)
      .where('date', '<', nextMonth)
      .orderBy('date', 'asc')
      .fetch()).toJSON();

    const userDetailStatistics =  fetchedUserStatistics.map(s => ({
        id: s.id,
        userName: `${s.first_name} ${s.last_name}`,
        currentXp: s.userTotalExp[0] ? s.userTotalExp[0].total_exp : 0,
        bonusXp: this.getTotalBonusXp(s.bonusExps),
        userDetailStatistics: s.projectParticipations.map(p => ({
          code: p.project.code,
          timeSpent: this.getTimeSpentInHours(p.time_spent),
          coefficient: this.getProjectCoefficient(p.time_spent),
          projectRatings: this.getRatings(p.project.standupProjectRating, standups),
          projectsXp: this.getProjectXp(this.getRatings(p.project.standupProjectRating, standups),
            this.getProjectCoefficient(p.time_spent), p.project.standupProjectRating),
        })),
      }));

    const userStatistics = {
      standups: standups,
      userStatistics: userDetailStatistics.map(s => ({
        id: s.id,
        userName: s.userName,
        currentXp: s.currentXp,
        bonusXp: s.bonusXp,
        sumXpProjects: this.getSumXpProjects(s.userDetailStatistics),
        sumHoursWorked: this.getSumHoursWorked(s.userDetailStatistics),
        XpPerMonth: s.bonusXp + this.getSumXpProjects(s.userDetailStatistics) + this.getSumHoursWorked(s.userDetailStatistics),
        totalXp: s.currentXp + s.bonusXp + this.getSumXpProjects(s.userDetailStatistics) + this.getSumHoursWorked(s.userDetailStatistics),
        currentLevel: this.calculateLevel(s.currentXp),
        newLevel: this.calculateLevel(s.currentXp + s.bonusXp + this.getSumXpProjects(s.userDetailStatistics) + this.getSumHoursWorked(s.userDetailStatistics)),
        userDetail: s.userDetailStatistics,
      })),
    };

    return userStatistics;
  }

  setUserExperience(currentMonth, nextMonth) {
    const userExperience = this.countUsersXp(currentMonth, nextMonth);

    userExperience.userStatistics.forEach(async u => {
      const totalExp = await UserTotalExpModel
        .query()
        .where('date', '>=', currentMonth)
        .where('date', '<', nextMonth)
        .where('user_id', '=', u.id)
        .fetch();

      if (totalExp) {
        await totalExp.update({ total_exp: u.totalXp });
      } else {
        await UserTotalExpModel.create({
          user_id: u.id,
          totalExp: u.totalExp,
          date: currentMonth,
        });
      }
    });
  }

  getTimeSpentInHours(timeSpent) {
    const timeSpentInHours = (timeSpent / 60) / 60;

    return Math.round((timeSpentInHours + Number.EPSILON) * 100) / 100;
  }

  getProjectCoefficient(timeSpent) {
    const AVERAGE_HOURS_PER_MONTH = 176;
    const projectCoefficient = (((timeSpent / 60) /60) / AVERAGE_HOURS_PER_MONTH) * 100;

    return Math.round((projectCoefficient + Number.EPSILON) * 100) / 100;
  }

  getRatings(ratings, standups) {
    return standups.map(p => ({
      rating: ratings.filter(r => r.standup_id === p.id)[0] ? ratings.filter(r => r.standup_id === p.id)[0].projectRating.value : 0,
    }));
  }

  getProjectXp(projectRatings, projectCoefficient, projectRatingsWithoutZeros) {
    const projectRatingSum = projectRatings.reduce((acc, cur) => acc + cur.rating, 0);
    const projectXp = (projectRatingSum / projectRatingsWithoutZeros.length * projectRatings.length) * projectCoefficient / 100;

    return Math.round((projectXp + Number.EPSILON));
  }

  getSumXpProjects(userDetailStatistics) {
    return userDetailStatistics.reduce((acc, cur) => acc + cur.projectsXp, 0);
  }
  getSumHoursWorked(userDetailStatistics) {
    const SumHoursWorked = userDetailStatistics.reduce((acc, cur) => acc + cur.timeSpent, 0);

    return Math.round((SumHoursWorked + Number.EPSILON));
  }

  calculateLevel(exp) {
    const d = -500 + Math.sqrt(500 * 500 + 4 * 5 * exp);
    const result = d / (2 * 5);

    return Math.floor(result);
  };

  getTotalBonusXp(bonusExps) {
    return bonusExps ? bonusExps.reduce((acc, cur) => acc + cur.exp, 0) : 0;
  }
}

module.exports = new UsersXpCounter();
