'use strict';

class StoreProjectValidator {
  get rules() {
    const projectId = this.ctx.params.id;

    return {
      code: `required|max:255|min:1|unique:projects,code,id,${projectId}`,
      description: 'max:255',
      slackChannelName: 'required|max:255|min:1',
      project_start_at: 'date',
      project_end_at: 'date',
      meeting_time_id: 'number',
    };
  }
}

module.exports = StoreProjectValidator;
