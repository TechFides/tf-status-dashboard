const ProjectUserModel = use('App/Models/ProjectUser');
const moment = require('moment');

class ProjectUserService {
  async copyTeamLeadersFromLastMonth() {
    const now = new Date();
    const lastMonth = moment().subtract(1, 'month').toDate();

    const query = ProjectUserModel.query()
      .whereRaw('YEAR(month) = ?', lastMonth.getFullYear())
      .andWhereRaw('MONTH(month) = ?', lastMonth.getMonth() + 1);

    const teamleaders = await query.fetch();

    for (const teamleader of teamleaders.rows) {
      const result = await ProjectUserModel.query()
        .where('user_id', '=', teamleader.user_id)
        .andWhere('project_id', '=', teamleader.project_id)
        .andWhereRaw('YEAR(month) = ?', now.getFullYear())
        .andWhereRaw('MONTH(month) = ?', now.getMonth() + 1)
        .fetch();

      if (result.rows.length > 0) {
        continue;
      }

      await ProjectUserModel.create({
        project_id: teamleader.project_id,
        user_id: teamleader.user_id,
        project_exp_modifier_id: teamleader.project_exp_modifier_id,
        month: now,
      });
    }
  }
}

module.exports = new ProjectUserService();
