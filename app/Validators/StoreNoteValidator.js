'use strict';

class StoreNoteValidator {
  get rules() {
    return {
      deadlineDate: 'required|date',
      note: `required|min:1`,
      projectId: 'required|number',
    };
  }
}

module.exports = StoreNoteValidator;
