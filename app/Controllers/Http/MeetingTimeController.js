'use strict';

const MeetingTimeModel = use('App/Models/MeetingTime');

class MeetingTimeController {
  static mapToDbEntity (request) {
    const {
      weekDay,
      time,
      name,
    } = request.only(['weekDay', 'time', 'name']);

    return {
      week_day: weekDay,
      time,
      name,
    };
  }

  async getMeetingTimes ({ request, response, params }) {
    const query = MeetingTimeModel
      .query()
      .with('projects');

    const meetingTimes = await query.fetch();

    return meetingTimes.toJSON();
  }

  async createMeetingTime ({ request, response, params }) {
    const meetingTime = new MeetingTimeModel();
    meetingTime.fill(MeetingTimeController.mapToDbEntity(request));
    await meetingTime.save();

    return meetingTime.toJSON();
  }

  async editMeetingTime ({ request, response, params }) {
    const { id } = params;
    const meetingTime = await MeetingTimeModel.find(id);
    meetingTime.merge(MeetingTimeController.mapToDbEntity(request));
    await meetingTime.save();

    return meetingTime.toJSON();
  }

  async deleteMeetingTime ({ request, response, params }) {
    const { id } = params;
    const meetingTime = await MeetingTimeModel.find(id);

    try {
      await meetingTime.delete();
      response.send();
    } catch (e) {
      response.status(500).send({message: e.message});
    }
  }
}

module.exports = MeetingTimeController;
