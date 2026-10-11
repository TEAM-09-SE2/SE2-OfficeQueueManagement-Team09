const OFFICE_TIME_ZONE = "Europe/Rome";

// Date (YYYY-MM-DD) in the office time zone: the office day changes at
// midnight in Italy.
function officeDate(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: OFFICE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// ISO 8601 UTC time without milliseconds, the format of issue_at and served_at.
function toIsoSeconds(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

// UTC time (same format as issue_at) at which an office day starts. Midnight
// in Italy is 23:00 UTC of the day before in winter (UTC+1) and 22:00 UTC in
// summer (UTC+2).
function officeDayStart(day) {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  const utcMidnight = Date.UTC(year, month - 1, dayOfMonth);
  for (const offsetHours of [1, 2]) {
    const start = new Date(utcMidnight - offsetHours * 60 * 60 * 1000);
    const secondBefore = new Date(start.getTime() - 1000);
    if (officeDate(start) === day && officeDate(secondBefore) !== day) {
      return toIsoSeconds(start);
    }
  }
  throw new Error(`Cannot find when the office day ${day} starts.`);
}

// The office day (YYYY-MM-DD) after `day`.
function nextOfficeDay(day) {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, dayOfMonth + 1))
    .toISOString()
    .slice(0, 10);
}

module.exports = {
  officeDate,
  officeDayStart,
  nextOfficeDay,
  toIsoSeconds,
};
