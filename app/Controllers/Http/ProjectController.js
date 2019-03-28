'use strict';

const ProjectModel = use('App/Models/Project');
const NoteModel = use('App/Models/Note');

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
      .with('meetingTime');

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

  async deleteProject ({ request, response, params }) {
    const { id } = params;
    const project = await ProjectModel.find(id);

    try {
      await NoteModel
        .query()
        .where('project_id', '=', id)
        .update({is_active: 0});

      await project.delete();
      response.send();
    } catch (e) {
      return e.toJSON();
    }
  }
}

module.exports = ProjectController;
