'use strict';

/*
|--------------------------------------------------------------------------
| TruncateSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const BonusExpModel = use('App/Models/BonusExp');
const FeedbackModel = use('App/Models/Feedback');
const FeedbackTokenModel = use('App/Models/FeedbackToken');
const HeatmapWeekModel = use('App/Models/HeatmapWeek');
const NoteModel = use('App/Models/Note');
const UserProjectParticipationModel = use('App/Models/UserProjectParticipation');
const ProjectExpModifierModel = use('App/Models/ProjectExpModifier');
const ProjectModel = use('App/Models/Project');
const SitdownProjectRatingEnumModel = use('App/Models/SitdownProjectRatingEnum');
const SitdownProjectRatingModel = use('App/Models/SitdownProjectRating');
const SitdownModel = use('App/Models/Sitdown');
const UserModel = use('App/Models/User');
const MeetingTimeModel = use('App/Models/MeetingTime');

class TruncateSeeder {
  async run() {
    await BonusExpModel.query().delete();
    await FeedbackModel.query().delete();
    await FeedbackTokenModel.query().delete();
    await HeatmapWeekModel.query().delete();
    await NoteModel.query().delete();
    await UserProjectParticipationModel.query().delete();
    await ProjectExpModifierModel.query().delete();
    await UserModel.query().delete();
    await SitdownProjectRatingModel.query().delete();
    await ProjectModel.query().delete();
    await SitdownModel.query().delete();
    await SitdownProjectRatingEnumModel.query().delete();
    await MeetingTimeModel.query().delete();
  }
}

module.exports = TruncateSeeder;
