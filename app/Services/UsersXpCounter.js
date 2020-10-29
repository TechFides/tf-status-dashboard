'use strict';

const { EXP_MODIFIER, AVERAGE_MONTH_WORKED_HOURS } = require('../../constants');
const format = require('date-fns/format');

const UserModel = use('App/Models/User');
const SitdownModel = use('App/Models/Sitdown');
const UserTotalExpModel = use('App/Models/UserTotalExp');
const UserProjectParticipationModel = use('App/Models/UserProjectParticipation');
const JiraSynchronizationModel = use('App/Models/JiraSynchronization');

class UsersXpCounter {
  async countUsersXp(currentMonth, nextMonth) {
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, currentMonth.getDate());

    const fetchedUserStatistics = (
      await UserModel.query()
        .where('is_active', true)
        .with('position')
        .with('bonusExps', builder => {
          builder.where('date', '>=', currentMonth).where('date', '<', nextMonth);
        })
        .with('userTotalExp', builder => {
          builder.where('date', '>=', previousMonth).where('date', '<', currentMonth);
        })
        .with('projectParticipations', builder => {
          builder
            .where('date', '>=', currentMonth)
            .where('date', '<', nextMonth)
            .with('project', builder => {
              builder
                .with('projectUser', builder => {
                  builder
                    .whereRaw('YEAR(month) = ?', currentMonth.getFullYear())
                    .andWhereRaw('MONTH(month) = ?', currentMonth.getMonth() + 1)
                    .with('projectExpModifier');
                })
                .with('sitdownProjectRating', builder => {
                  builder
                    .whereHas('sitdown', builder => {
                      builder.where('date', '>=', currentMonth).where('date', '<', nextMonth);
                    })
                    .with('projectRating')
                    .with('sitdown');
                });
            });
        })
        .fetch()
    ).toJSON();

    const sitdowns = (
      await SitdownModel.query()
        .where('date', '>=', currentMonth)
        .where('date', '<', nextMonth)
        .orderBy('date', 'asc')
        .fetch()
    ).toJSON();

    const allUsersTimespent = (
      await UserProjectParticipationModel.query()
        .where('date', '>=', currentMonth)
        .where('date', '<', nextMonth)
        .fetch()
    ).toJSON();

    const userDetailStatistics = fetchedUserStatistics
      .filter(f => f.position && f.position.is_player)
      .map(s => ({
        id: s.id,
        userName: `${s.first_name} ${s.last_name}`,
        previousXp: s.userTotalExp[0] ? s.userTotalExp[0].total_exp : 0,
        bonusXp: this.getTotalBonusXp(s.bonusExps),
        userDetailStatistics: s.projectParticipations.map(p => ({
          code: p.project.code,
          projectExpModifierName: this.getProjectExpModifierName(
            this.getExpModifier(p.project.projectUser && p.project.projectUser[0], s.id, allUsersTimespent),
          ),
          timeSpent: this.getTimeSpentInHours(p.time_spent),
          coefficient: this.getProjectCoefficient(p.time_spent),
          projectRatings: this.getRatings(p.project.sitdownProjectRating, sitdowns),
          projectsXp: this.getProjectXp(
            this.getRatings(p.project.sitdownProjectRating, sitdowns),
            this.getProjectCoefficient(p.time_spent),
            p.project.sitdownProjectRating,
            this.getExpModifier(p.project.projectUser, s.id, allUsersTimespent),
          ),
        })),
      }));

    const syncData = await this.getSyncData();

    const userStatistics = {
      sitdowns: sitdowns,
      jiraSynchronization: {
        status: syncData.status,
        startSyncTime: syncData.startSyncTime,
        lastDuration: syncData.lastDuration,
      },
      userStatistics: userDetailStatistics.map(s => ({
        id: s.id,
        userName: s.userName,
        previousXp: s.previousXp,
        bonusXp: s.bonusXp,
        sumXpProjects: this.getSumXpProjects(s.userDetailStatistics),
        sumHoursWorked: this.getSumHoursWorked(s.userDetailStatistics),
        monthXp:
          s.bonusXp + this.getSumXpProjects(s.userDetailStatistics) + this.getSumHoursWorked(s.userDetailStatistics),
        totalXp:
          s.previousXp +
          s.bonusXp +
          this.getSumXpProjects(s.userDetailStatistics) +
          this.getSumHoursWorked(s.userDetailStatistics),
        currentLevel: this.calculateLevel(s.previousXp),
        newLevel: this.calculateLevel(
          s.previousXp +
            s.bonusXp +
            this.getSumXpProjects(s.userDetailStatistics) +
            this.getSumHoursWorked(s.userDetailStatistics),
        ),
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
        const totalExp = await UserTotalExpModel.query()
          .where('date', '>=', startOfMonth)
          .where('date', '<', endOfMonth)
          .where('user_id', '=', u.id)
          .fetch();

        if (startOfMonth === startingDate) {
          incrementValue = u.totalXp - (totalExp.rows.length > 0 ? totalExp.rows[0].total_exp : 0);
        }

        if (totalExp.rows.length > 0) {
          if (startOfMonth > startingDate) {
            tempTotalXp = totalExp.rows[0].total_exp + incrementValue;
          }

          await UserTotalExpModel.query()
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
    }
  }

  roundNumber(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  getTimeSpentInHours(timeSpent) {
    return this.roundNumber(timeSpent / 3600);
  }

  getProjectCoefficient(timeSpent) {
    const averageMonthWorkedHours = AVERAGE_MONTH_WORKED_HOURS;
    const projectCoefficient = (this.getTimeSpentInHours(timeSpent) / averageMonthWorkedHours) * 100;

    return this.roundNumber(projectCoefficient);
  }

  getRatings(ratings, sitdowns) {
    return sitdowns.map(p => {
      const projectRating = ratings.filter(r => r.sitdown_id === p.id)[0];

      return {
        rating: projectRating ? projectRating.projectRating.value : 0,
      };
    });
  }

  getProjectXp(projectRatings, projectCoefficient, projectRatingsWithoutZeros, projectModifier) {
    const projectRatingSum = projectRatings.reduce((acc, cur) => acc + cur.rating, 0);
    const numberOfRatings = projectRatings.length === 0 ? 1 : projectRatings.length;

    let numberOfRatingsWithoutZeros = projectRatingsWithoutZeros.filter(p => p.projectRating.value !== 0);
    numberOfRatingsWithoutZeros = numberOfRatingsWithoutZeros.length === 0 ? 1 : numberOfRatingsWithoutZeros.length;

    const projectXp =
      ((projectRatingSum / numberOfRatingsWithoutZeros) *
        numberOfRatings *
        projectCoefficient *
        projectModifier.value) /
      100;

    return Math.round(projectXp + Number.EPSILON);
  }

  getSumXpProjects(userDetailStatistics) {
    return userDetailStatistics.reduce((acc, cur) => acc + cur.projectsXp, 0);
  }

  getSumHoursWorked(userDetailStatistics) {
    const SumHoursWorked = userDetailStatistics.reduce((acc, cur) => acc + cur.timeSpent, 0) * 1.5;

    return Math.round(SumHoursWorked + Number.EPSILON);
  }

  calculateLevel(exp) {
    const d = -500 + Math.sqrt(500 * 500 + 4 * 5 * exp);
    const result = d / (2 * 5);

    return Math.floor(result);
  }

  getTotalBonusXp(bonusExps) {
    return bonusExps ? bonusExps.reduce((acc, cur) => acc + cur.exp, 0) : 0;
  }

  getExpModifier(projectUser, teamLeaderId, allUsersTimespent) {
    if (!projectUser) return EXP_MODIFIER.WITHOUT_LEADER;
    if (projectUser.user_id !== teamLeaderId) {
      return EXP_MODIFIER.OTHER_LEADER;
    }

    const timeSpentsOfRestTeam = allUsersTimespent.filter(
      u => projectUser.project_id === u.project_id && teamLeaderId !== u.user_id,
    );
    const sumTimeSpentsOfRestTeam = timeSpentsOfRestTeam.reduce((acc, cur) => {
      return acc + this.getProjectCoefficient(cur.time_spent);
    }, 0);

    if (
      (projectUser.projectExpModifier.id === 1 && timeSpentsOfRestTeam.length === 0) ||
      sumTimeSpentsOfRestTeam <= 50
    ) {
      return EXP_MODIFIER.SOLO_PLAYER;
    }

    const teamLeader = {
      name: EXP_MODIFIER.TEAM_LEADER.name,
      value: 1 + (sumTimeSpentsOfRestTeam / 100) * 0.5,
    };

    return teamLeader;
  }

  getProjectExpModifierName(expModifier) {
    if (expModifier.name === EXP_MODIFIER.WITHOUT_LEADER.name) {
      return 'Projekt nemá vedoucího týmu';
    }

    if (expModifier.name === EXP_MODIFIER.OTHER_LEADER.name) {
      return 'Vedoucí týmu je někdo jiný';
    }

    if (expModifier.name === EXP_MODIFIER.SOLO_PLAYER.name) {
      return 'Sólo hráč';
    }

    return 'Vedoucí týmu';
  }

  millisToMinutesAndSeconds(millis) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return (minutes > 0 ? minutes + 'm ' : '') + (seconds < 10 ? '0' : '') + seconds + 's';
  }

  async getSyncData() {
    const jiraSyncData = (await JiraSynchronizationModel.query().orderBy('start_date', 'desc').fetch()).toJSON();

    const syncDuration =
      jiraSyncData.length > 1 ? new Date(jiraSyncData[1].finish_date) - new Date(jiraSyncData[1].start_date) : 0;

    return {
      startSyncTime: jiraSyncData.length > 0 ? format(jiraSyncData[0].start_date, 'HH:mm:ss') : '',
      lastDuration: this.millisToMinutesAndSeconds(syncDuration),
      status: jiraSyncData.length > 0 ? jiraSyncData[0].status : 0,
    };
  }
}

module.exports = new UsersXpCounter();
