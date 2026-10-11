const db = require("./connection");

/* Closes every ticket issued before `before` (UTC, same format as issue_at)
 that is still open: a ticket being served becomes SERVED, a ticket still
 waiting in its queue becomes EXPIRED. One statement, so either all of them
 change or none. Returns how many tickets changed.

 The daily reset passes the start of the current office day; a manual reset
 (POST /api/queues/reset, Config counters story) can pass the current time.
 */
function closeTicketsIssuedBefore(before) {
  const query = `UPDATE tickets
     SET status = CASE status WHEN 'SERVING' THEN 'SERVED' ELSE 'EXPIRED' END
     WHERE status IN ('WAITING', 'SERVING') AND issue_at < ?
     RETURNING status`;
  return new Promise((resolve, reject) => {
    db.all(query, [before], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const served = rows.filter((row) => row.status === "SERVED").length;
      resolve({ served, expired: rows.length - served });
    });
  });
}

/* Restarts the ticket counters of the services that still refer to a previous
 day: current_number becomes NULL (no ticket issued yet on `today`). Counters
 already on `today` are not touched, so running it again on the same day
 changes nothing. Returns how many services changed.
 */
function resetServiceCounters(today) {
  const query = `UPDATE services SET current_number = NULL, last_ticket_date = ?
     WHERE last_ticket_date IS NULL OR last_ticket_date < ?`;
  return new Promise((resolve, reject) => {
    db.run(query, [today, today], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

module.exports = { closeTicketsIssuedBefore, resetServiceCounters };
