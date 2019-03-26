'use strict';

class StoreMeetingTimeValidator {
  get rules () {
    return {
      weekDay: 'required|number',
      hour: 'required',
      name: 'required',
    };
  }
}

module.exports = StoreMeetingTimeValidator;
