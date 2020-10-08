'use strict';

const SitdownModel = use('App/Models/Sitdown');
const SitdownProjectRatingEnumModel = use('App/Models/SitdownProjectRatingEnum');
const SitdownProjectRating = use('App/Models/SitdownProjectRating');
const ProjectRatingMessenger = use('App/Services/ProjectRatingMessenger');
const PositionModel = use('App/Models/Position');

class ProjectRatingController {
  async setProjectRating({ request, response }) {
    const { projectId, sitdownId, ratingValueId } = request.body;

    try {
      const ratingData = { project_id: projectId, sitdown_id: sitdownId };
      const [rating, ratingValue] = await Promise.all([
        SitdownProjectRating.findOrCreate(ratingData, ratingData),
        SitdownProjectRatingEnumModel.find(ratingValueId),
      ]);

      rating.projectRating().associate(ratingValue);

      await ProjectRatingMessenger.sendRatingMessage(projectId, ratingValue.toJSON(), ratingValueId);

      await rating.save();
      response.status(200).send();
    } catch (e) {
      console.error(e);
      response.status(404).send();
    }
  }

  async getProjectRatings({ request, response, session }) {
    let { month, year } = request.get();
    month = Number(month);
    year = Number(year);
    const currentMonth = new Date(year, month, 1);
    const nextMonth = new Date(year, month + 1, 1);

    const projects = await SitdownModel.query()
      .where('date', '>=', currentMonth)
      .where('date', '<', nextMonth)
      .with('sitdownProjectRating')
      .fetch();

    return projects.toJSON();
  }
}

module.exports = ProjectRatingController;
