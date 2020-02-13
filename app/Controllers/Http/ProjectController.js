'use strict';

const ProjectModel = use('App/Models/Project');
const NoteModel = use('App/Models/Note');
const ProjectUserModel = use('App/Models/ProjectUser');

class ProjectController {
  static getProjectData (request) {
    const {
      code,
      description,
      isActive,
      meetingTimeId,
    } = request.only(['code', 'description', 'isActive', 'meetingTimeId']);

    return {
      code,
      description,
      is_active: isActive,
      meeting_time_id: meetingTimeId,
    };
  }

  async getProjects ({ request, response, params }) {
    const { isActive } = request.get();
    const projectsQuery = ProjectModel
      .query()
      .with('notes')
      .with('meetingTime')
      .with('projectUser', (builder) => {
        builder
          .whereHas('projectExpModifier', (builder) => {
            builder
              .where('value', '>', 1);
          })
        .with('user');
      });

    if (isActive === 'true') {
      projectsQuery
        .where('is_active', true);
    }

    const projects = await projectsQuery
      .fetch();

    return projects.toJSON();
  }

  async createProject ({ request, response }) {
    const project = new ProjectModel();
    project.fill(ProjectController.getProjectData(request));
    await project.save();

    return project.toJSON();
  }

  async editProject ({ request, response, params }) {
    const { id } = params;
    const project = await ProjectModel.find(id);
    project.merge(ProjectController.getProjectData(request));
    await project.save();

    return project.toJSON();
  }

  async addTeamLeader ({ request, response, params }) {
    const {projectId, userId, teamLeaderTypeId} = request.only(['projectId', 'userId', 'teamLeaderTypeId']);

    const ProjectUser = await ProjectUserModel
      .query()
      .where('project_id', '=', projectId)
      .fetch();

    if (ProjectUser.rows.length > 0) {
      if (userId === 0) {
        await ProjectUserModel
          .query()
          .where('project_id', '=', projectId)
          .delete();
      } else {
        await ProjectUserModel
          .query()
          .where('project_id', '=', projectId)
          .update({
            project_exp_modifier_id: teamLeaderTypeId,
            user_id: userId,
          });
      }
    } else {
      await ProjectUserModel.create({
        project_id: projectId,
        user_id: userId,
        project_exp_modifier_id: teamLeaderTypeId,
      });
    }
  }

  async deleteProject ({ request, response, params }) {
    const { id } = params;
    const project = await ProjectModel.find(id);

    try {
      await NoteModel
        .query()
        .where('project_id', '=', id)
        .update({ is_active: 0 });

      await project.delete();
      response.send();
    } catch (e) {
      return e.toJSON();
    }
  }
}

module.exports = ProjectController;
