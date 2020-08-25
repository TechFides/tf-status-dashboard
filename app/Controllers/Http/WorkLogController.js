'use strict';

const WorkLogModel = use('App/Models/WorkLog');

class WorkLogController {
  static mapToDbEntity (request) {
    const {
      authorId,
      started,
      timeSpent,
      description,
      costCategory,
    } = request.only(['authorId', 'started', 'timeSpent', 'description', 'costCategory']);

    return {
      user_id: authorId,
      started,
      time_spent: timeSpent,
      description,
      cost_category: costCategory,
    };
  }

  async getWorkLogsList ({ request, response, params }) {
    const { startDate, endDate, authorId, costCategoryId } = request.get();
    const WorkLogModelQuery = WorkLogModel
      .query()
      .with('user')
      .with('absenceApprover')
      .with('absenceTypeEnum')
      .with('absenceStateEnum')
      .where('user_id', userId);

    if (absenceType) {
      WorkLogModelQuery.where('absence_type_enum_id', absenceType);
    }

    if (absenceState) {
      WorkLogModelQuery.where('absence_state_enum_id', absenceState);
    }

    const officeAbsenceList = (await officeAbsenceQuery.fetch()).toJSON();

    return notes.toJSON();
  }

  async createNote ({ request, response, params }) {
    const note = new NoteModel();
    note.fill(NoteController.mapToDbEntity(request));
    await note.save();

    return note.toJSON();
  }

  async editNote ({ request, response, params }) {
    const { id } = params;
    const note = await NoteModel.find(id);
    note.merge(NoteController.mapToDbEntity(request));
    await note.save();

    return note.toJSON();
  }

  async editNote ({ request, response, params }) {
    const { id } = params;
    const note = await NoteModel.find(id);
    note.merge(NoteController.mapToDbEntity(request));
    await note.save();

    return note.toJSON();
  }
}

module.exports = WorkLogController;
