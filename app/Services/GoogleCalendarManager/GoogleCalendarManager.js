'use strict';

const CONFIG = require('./Settings');
const CalendarAPI = require('node-google-calendar');
const moment = require('moment');
const Env = use('Env');

const OfficeAbsenceMessanger = use('App/Services/OfficeAbsenceMessanger');

let cal = new CalendarAPI(CONFIG);

class GoogleCalendarManager {
  async createEvent (officeAbsence) {
    const calendarId = Env.get('GOOGLE_CALENDAR_ID');
    let params = {
      'summary': officeAbsence.calendar_event_title,
      'description': officeAbsence.description,
      'start': {
        'date': moment(officeAbsence.absence_start).format('YYYY-MM-DD'),
      },
      'end': {
        'date': moment(officeAbsence.absence_end).format('YYYY-MM-DD'),
      },
    };

    try {
      if (!officeAbsence.google_event_id) {
        const res = await cal.Events.insert(calendarId, params);
        officeAbsence.google_event_id = res.id;
        await officeAbsence.save();
      }
    } catch (e) {
      OfficeAbsenceMessanger.sendError(e.message);
    }
  }

  async deleteEvent (officeAbsence) {
    const calendarId = Env.get('GOOGLE_CALENDAR_ID');

    try {
      if (officeAbsence.google_event_id) {
        await cal.Events.delete(calendarId, officeAbsence.google_event_id);
        officeAbsence.google_event_id = '';
        await officeAbsence.save();
      }
    } catch (e) {
      OfficeAbsenceMessanger.sendError(e.message);
    }
  }
}

module.exports = new GoogleCalendarManager();
