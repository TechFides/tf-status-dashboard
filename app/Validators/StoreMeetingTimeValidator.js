'use strict';

class StoreMeetingTimeValidator {
  get rules () {
    return {
      weekDay: 'required|min:1', // Enum
      hour: 'required',
      name: 'required',
    };
  }
}

module.exports = StoreMeetingTimeValidator;
