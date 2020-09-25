require('dotenv').config();

const SERVICE_ACCT_ID = process.env.GOOGLE_SERVICE_EMAIL;
const CALENDAR_ID = {
  primary: 'c_7o4420u4f1rftv0r740mn3ids0@group.calendar.google.com',
};
const TIMEZONE = 'UTC+02:00';

module.exports.key = process.env.GOOGLE_PRIVATE_KEY;
module.exports.serviceAcctId = SERVICE_ACCT_ID;
module.exports.calendarId = CALENDAR_ID;
module.exports.timezone = TIMEZONE;
