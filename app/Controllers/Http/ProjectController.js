'use strict';

const { WebClient } = require('@slack/web-api');

const ProjectModel = use('App/Models/Project');
const NoteModel = use('App/Models/Note');
const ProjectUserModel = use('App/Models/ProjectUser');
const SlackChannelModel = use('App/Models/SlackChannel');
const StandupProjectRatingModel = use('App/Models/StandupProjectRating');
const Env = use('Env');

class ProjectController {
  static async checkSlackChannel(slackChannelName) {
    const slackWebClient = new WebClient(Env.get('SLACK_TOKEN'));
    let channelData = {
      error: '',
      id: '',
    };

    const { channels } = await slackWebClient.conversations.list({
      limit: 1000,
      types: 'public_channel, private_channel',
    });
    const slackChannel = channels.find(s => s.name === slackChannelName);

    if (!slackChannel) {
      channelData.error =
        "Žádný takový kanál neexistuje nebo se jedná o privátní kanál a je nutné do tohoto kanálu bota pozvat (v kanálu odeslat zprávu: /invite @'nazev_bota').";
      return channelData;
    }

    const { members } = await slackWebClient.conversations.members({ channel: slackChannel.id });
    let slackBot = null;

    for (const member of members) {
      let { user } = await slackWebClient.users.info({ user: member });
      if (user.is_bot) {
        slackBot = user;
        break;
      }
    }

    if (!slackBot) {
      channelData.error =
        "Bot pro odesílání zpráv není pozvaný do tohoto kanálu (v kanálu odeslat zprávu: /invite @'nazev_bota').";
      return channelData;
    }

    channelData.id = slackChannel.id;
    return channelData;
  }

  async getProjects({ request, response, params }) {
    const { isActive } = request.get();
    const projectsQuery = ProjectModel.query()
      .with('notes')
      .with('meetingTime')
      .with('slackChannel')
      .with('projectUser', builder => {
        builder
          .whereHas('projectExpModifier', builder => {
            builder.where('value', '>', 1);
          })
          .with('user');
      });

    if (isActive === 'true') {
      projectsQuery.where('is_active', true);
    }

    const projects = await projectsQuery.fetch();

    return projects.toJSON();
  }

  async createProject({ request, response }) {
    const { code, description, isActive, meetingTimeId, slackChannelName } = request.only([
      'code',
      'description',
      'isActive',
      'meetingTimeId',
      'slackChannelName',
    ]);

    const project = new ProjectModel();
    const channelData = await ProjectController.checkSlackChannel(slackChannelName);

    if (channelData.error) {
      return response.status(404).send({ message: channelData.error });
    }

    await SlackChannelModel.findOrCreate(
      {
        id: channelData.id,
      },
      {
        channel_name: slackChannelName,
        id: channelData.id,
      },
    );

    const projectData = {
      code,
      description,
      slack_channel_id: channelData.id,
      is_active: isActive,
      meeting_time_id: meetingTimeId,
    };

    project.fill(projectData);
    await project.save();

    return project.toJSON();
  }

  async editProject({ request, response, params }) {
    const { id } = params;
    const { code, description, isActive, meetingTimeId, slackChannelName } = request.only([
      'code',
      'description',
      'isActive',
      'meetingTimeId',
      'slackChannelName',
    ]);

    const project = await ProjectModel.find(id);
    const channelData = await ProjectController.checkSlackChannel(slackChannelName);

    if (channelData.error) {
      return response.status(404).send({ message: channelData.error });
    }

    const slackChannel = await SlackChannelModel.find(channelData.id);

    if (slackChannel) {
      const slackChannelData = {
        channel_name: slackChannelName,
        id: channelData.id,
      };

      slackChannel.merge(slackChannelData);
      await slackChannel.save();
    } else {
      await SlackChannelModel.create({
        channel_name: slackChannelName,
        id: channelData.id,
      });
    }

    const projectData = {
      code,
      description,
      slack_channel_id: channelData.id,
      is_active: isActive,
      meeting_time_id: meetingTimeId,
    };

    project.merge(projectData);
    await project.save();

    return project.toJSON();
  }

  async addTeamLeader({ request, response, params }) {
    const { projectId, userId } = request.only(['projectId', 'userId']);

    const projectUser = await ProjectUserModel.query().where('project_id', '=', projectId).fetch();

    if (projectUser.rows.length > 0) {
      if (userId === 0) {
        await ProjectUserModel.query().where('project_id', '=', projectId).delete();
      } else {
        await ProjectUserModel.query().where('project_id', '=', projectId).update({
          project_exp_modifier_id: 1,
          user_id: userId,
        });
      }
    } else {
      await ProjectUserModel.create({
        project_id: projectId,
        user_id: userId,
        project_exp_modifier_id: 1,
      });
    }
  }

  async deleteProject({ request, response, params }) {
    const { id } = params;
    const project = await ProjectModel.find(id);

    try {
      await StandupProjectRatingModel.query().where('project_id', '=', id).delete();

      await NoteModel.query().where('project_id', '=', id).update({ is_active: 0 });

      await project.delete();
      response.send();
    } catch (e) {
      response.status(500).send({ message: e.message });
    }
  }
}

module.exports = ProjectController;
