'use strict';

const { EXP_MODIFIER } = require('../../../constants');
const { WebClient } = require('@slack/web-api');

const ProjectModel = use('App/Models/Project');
const NoteModel = use('App/Models/Note');
const ProjectUserModel = use('App/Models/ProjectUser');
const UserProjectParticipationModel = use('App/Models/UserProjectParticipation');
const Env = use('Env');

class ProjectController {
  static getProjectData (request) {
    const {
      code,
      description,
      isActive,
      meetingTimeId,
      slackChannel,
    } = request.only(['code', 'description', 'isActive', 'meetingTimeId', 'slackChannel']);

    return {
      code,
      description,
      slack_channel: slackChannel,
      is_active: isActive,
      meeting_time_id: meetingTimeId,
    };
  }

  static async checkSlackChannel (slackChannelName) {
    const slackWebClient = new WebClient(Env.get('SLACK_TOKEN'));

    const { channels } = await slackWebClient.conversations.list({limit: 1000});
    const slackChannel = channels.find(s => s.name === slackChannelName);

    if (!slackChannel) {
      return 'Žádný takový kanál neexistuje.';
    }

    const { members } = await slackWebClient.conversations.members({channel: slackChannel.id});
    let slackBot = null;

    for (const member of members) {
      let { user } = await slackWebClient.users.info({user: member});
      if (user.is_bot) {
        slackBot = user;
        break;
      }
    }

    if (!slackBot) {
      return 'Bot pro odesílání zpráv není pozvaný do kanálu (V kanálu odeslat zprávu: @\'název bota\').';
    }

    return null;
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

    const projectData = ProjectController.getProjectData(request);
    const isSlackChannelInvalid = await ProjectController.checkSlackChannel(projectData.slack_channel);

    if (isSlackChannelInvalid) {
      return response.status(404).send({ message: isSlackChannelInvalid });
    }

    project.fill(projectData);
    await project.save();

    return project.toJSON();
  }

  async editProject ({ request, response, params }) {
    const { id } = params;
    const project = await ProjectModel.find(id);

    const projectData = ProjectController.getProjectData(request);
    const isSlackChannelInvalid = await ProjectController.checkSlackChannel(projectData.slack_channel);

    if (isSlackChannelInvalid) {
      return response.status(404).send({ message: isSlackChannelInvalid });
    }

    project.merge(projectData);
    await project.save();

    return project.toJSON();
  }

  async addTeamLeader ({ request, response, params }) {
    const {projectId, userId} = request.only(['projectId', 'userId']);

    const ProjectUser = await ProjectUserModel
      .query()
      .where('project_id', '=', projectId)
      .fetch();

    const UserProjectParticipation = await UserProjectParticipationModel
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
            project_exp_modifier_id: UserProjectParticipation.rows.length > 1 ? EXP_MODIFIER.TEAM_LEADER : EXP_MODIFIER.SOLO_PLAYER,
            user_id: userId,
          });
      }
    } else {
      await ProjectUserModel.create({
        project_id: projectId,
        user_id: userId,
        project_exp_modifier_id: UserProjectParticipation.rows.length > 1 ? EXP_MODIFIER.TEAM_LEADER  : EXP_MODIFIER.SOLO_PLAYER,
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
