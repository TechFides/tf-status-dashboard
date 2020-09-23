'use strict';

class StoreMeetingTimeValidator {
  get rules() {
    return {
      weekDay: 'required|number',
      time: 'required',
      name: 'required',
    };
  }
}

module.exports = StoreMeetingTimeValidator;
