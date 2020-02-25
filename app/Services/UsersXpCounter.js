'use strict';

const { EXP_MODIFIER } = require('../../constants');

const UserModel = use('App/Models/User');
const StandupModel = use('App/Models/Standup');
const UserTotalExpModel = use('App/Models/UserTotalExp');
const UserProjectParticipationModel = use('App/Models/UserProjectParticipation');

class UsersXpCounter {
  async countUsersXp (currentMonth, nextMonth) {
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() -1, currentMonth.getDate());

    const fetchedUserStatistics = (await UserModel
      .query()
      .where('is_active', true)
      .with('bonusExps', (builder) => {
        builder
          .where('date', '>=', currentMonth)
          .where('date', '<', nextMonth);
      })
      .with('userTotalExp', (builder) => {
        builder
          .where('date', '>=', previousMonth)
          .where('date', '<', currentMonth);
      })
      .with('projectParticipations', (builder) => {
        builder
          .where('date', '>=', currentMonth)
          .where('date', '<', nextMonth)
          .with('project', (builder) => {
            builder
              .with('projectUser', (builder) => {
                builder
                  .with('projectExpModifier');
              })
              .with('standupProjectRating', (builder) => {
                builder
                  .whereHas('standup', (builder) => {
                    builder
                      .where('date', '>=', currentMonth)
                      .where('date', '<', nextMonth);
                  })
                  .with('projectRating')
                  .with('standup');
              });
          });
      })
      .fetch()).toJSON();

    const standups = (await StandupModel
      .query()
      .where('date', '>=', currentMonth)
      .where('date', '<', nextMonth)
      .orderBy('date', 'asc')
      .fetch()).toJSON();

    const allUsersTimespent = (await UserProjectParticipationModel
      .query()
      .fetch()).toJSON();

    const userDetailStatistics =  fetchedUserStatistics.map(s => ({
        id: s.id,
        userName: `${s.first_name} ${s.last_name}`,
        previousXp: s.userTotalExp[0] ? s.userTotalExp[0].total_exp : 0,
        bonusXp: this.getTotalBonusXp(s.bonusExps),
        userDetailStatistics: s.projectParticipations.map(p => ({
          code: p.project.code,
          projectExpModifierName: this.getProjectExpModifierName(s.id, p.project.projectUser),
          timeSpent: this.getTimeSpentInHours(p.time_spent),
          coefficient: this.getProjectCoefficient(p.time_spent),
          projectRatings: this.getRatings(p.project.standupProjectRating, standups),
          projectsXp: this.getProjectXp(this.getRatings(p.project.standupProjectRating, standups),
            this.getProjectCoefficient(p.time_spent), p.project.standupProjectRating, this.getGetExpModifier(p.project.projectUser, s.id, allUsersTimespent)),
        })),
      }));

    const userStatistics = {
      standups: standups,
      userStatistics: userDetailStatistics.map(s => ({
        id: s.id,
        userName: s.userName,
        previousXp: s.previousXp,
        bonusXp: s.bonusXp,
        sumXpProjects: this.getSumXpProjects(s.userDetailStatistics),
        sumHoursWorked: this.getSumHoursWorked(s.userDetailStatistics),
        monthXp: s.bonusXp + this.getSumXpProjects(s.userDetailStatistics) + this.getSumHoursWorked(s.userDetailStatistics),
        totalXp: s.previousXp + s.bonusXp + this.getSumXpProjects(s.userDetailStatistics) + this.getSumHoursWorked(s.userDetailStatistics),
        currentLevel: this.calculateLevel(s.previousXp),
        newLevel: this.calculateLevel(s.previousXp + s.bonusXp + this.getSumXpProjects(s.userDetailStatistics) + this.getSumHoursWorked(s.userDetailStatistics)),
        userDetail: s.userDetailStatistics,
      })),
    };

    return userStatistics;
  }

  async setUserExperience(startingDate, endingDate, userExp) {
    const date = new Date();
    let startOfMonth = startingDate;
    let endOfMonth = endingDate;
    let tempTotalXp = 0;
    let incrementValue = 0;


    for (const u of userExp) {
      tempTotalXp = u.totalXp;
      while (startOfMonth <= date) {
        const totalExp = await UserTotalExpModel
          .query()
          .where('date', '>=', startOfMonth)
          .where('date', '<', endOfMonth)
          .where('user_id', '=', u.id)
          .fetch();

        if (startOfMonth === startingDate) {
          incrementValue = u.totalXp - (totalExp.rows.length > 0 ? totalExp.rows[0].total_exp: 0);
        }

        if (totalExp.rows.length > 0) {

          if (startOfMonth > startingDate) {
            tempTotalXp = totalExp.rows[0].total_exp + incrementValue;
          }

          await UserTotalExpModel
            .query()
            .where('date', '>=', startOfMonth)
            .where('date', '<', endOfMonth)
            .where('user_id', '=', u.id)
            .update({ total_exp: tempTotalXp });
        } else {
          await UserTotalExpModel.create({
            user_id: u.id,
            total_exp: tempTotalXp,
            date: startOfMonth,
          });
        }
        startOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, startOfMonth.getDate());
        endOfMonth = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth() + 1, endOfMonth.getDate());
      }
      startOfMonth = startingDate;
      endOfMonth = endingDate;
    };
  }

  roundNumber(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  getTimeSpentInHours(timeSpent) {
    return this.roundNumber(timeSpent / 3600);
  }

  getProjectCoefficient(timeSpent) {
    const AVERAGE_HOURS_PER_MONTH = 176;
    const projectCoefficient = (this.getTimeSpentInHours(timeSpent) / AVERAGE_HOURS_PER_MONTH) * 100;

    return this.roundNumber(projectCoefficient);
  }

  getRatings(ratings, standups) {
    return standups.map(p => {
      const projectRating = ratings.filter(r => r.standup_id === p.id)[0];

      return {
        rating: projectRating ? projectRating.projectRating.value : 0,
      };
    });
  }

  getProjectXp(projectRatings, projectCoefficient, projectRatingsWithoutZeros, projectModifier) {
    const projectRatingSum = projectRatings.reduce((acc, cur) => acc + cur.rating, 0);
    const numberOfRatings = projectRatings.length === 0 ? 1 : projectRatings.length;
    const numberOfRatingsWithoutZeros = projectRatingsWithoutZeros.length === 0 ? 1 : projectRatingsWithoutZeros.length;

    const projectXp = (projectRatingSum / numberOfRatings * numberOfRatingsWithoutZeros) * projectCoefficient * projectModifier / 100;

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

  getGetExpModifier(projectUser, teamLeaderId, allUsersTimespent) {
    if (!projectUser) return EXP_MODIFIER.WITHOUT_LEADER;
    if (projectUser.user_id !== teamLeaderId) {
      return EXP_MODIFIER.OTHER_LEADER;
    }

    if(projectUser.projectExpModifier.id === 1) {
      return EXP_MODIFIER.SOLO_PLAYER;
    }

    const teamLeaderTimespents = allUsersTimespent.filter(u => projectUser.project_id === u.project_id && teamLeaderId !== u.user_id);

    return teamLeaderTimespents.reduce((acc, cur) => {
      return acc + (this.getProjectCoefficient(cur.time_spent) / 100);
    }, 1);
  }

  getProjectExpModifierName(user, projectUser) {
    if (!projectUser) return 'Projekt nemá vedoucího týmu';

    if (user === projectUser.user_id) {
      if (projectUser.projectExpModifier.name === 'TEAM_LEADER') {
        return 'Vedoucí týmu';
      }

      if (projectUser.projectExpModifier.name === 'SOLO_PLAYER') {
        return 'Sólo hráč';
      }
    }

    return 'Vedoucí týmu je někdo jiný';
  }
}

module.exports = new UsersXpCounter();
