const db = require("./connection");

function findCounterById(counterId) {
  const query = `SELECT id, number FROM counters WHERE id = ?`;
  return new Promise((resolve, reject) => {
    db.get(query, [counterId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function findServicesByCounter(counterId) {
  const query = `SELECT s.id, s.name, s.processing_time
     FROM counters_services cs
     JOIN services s ON s.id = cs.id_service
     WHERE cs.id_counter = ?
     ORDER BY s.id`;
  return new Promise((resolve, reject) => {
    db.all(query, [counterId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/* A queue is the set of WAITING tickets of one service. Choosing the next ticket: 
 1. Among the services the counter can handle, take the one with the
 longest queue. Services with an empty queue are ignored.
 2. If several queues have the same length, take the service with
 the lowest processing time. If that is also equal, take the
 lowest service id.
 3. From that queue, take the ticket issued first.

 The chosen ticket is marked as SERVING and gets the calling counter and the call 
 time, which removes it from its queue. 

 Before that, the ticket the counter was serving until now (if any) is marked as
 SERVED, so a counter never has more than one SERVING ticket. This happens even
 when all the queues are empty and no new ticket is called.
 */
function callNextTicket(counterId, servedAt) {
  const closeQuery = `UPDATE tickets
     SET status = 'SERVED'
     WHERE id_counter = ? AND status = 'SERVING'`;
  const callQuery = `UPDATE tickets
     SET status = 'SERVING', id_counter = ?, served_at = ?
     WHERE id = (
       SELECT t.id
       FROM tickets t
       WHERE t.status = 'WAITING'
         AND t.id_service = (
           SELECT s.id
           FROM counters_services cs
           JOIN services s ON s.id = cs.id_service
           JOIN tickets w ON w.id_service = s.id AND w.status = 'WAITING'
           WHERE cs.id_counter = ?
           GROUP BY s.id
           ORDER BY COUNT(w.id) DESC, s.processing_time ASC, s.id ASC
           LIMIT 1
         )
       ORDER BY t.issue_at ASC, t.id ASC
       LIMIT 1
     )
     RETURNING id, code, id_service, id_counter, issue_at, served_at, status,
       (SELECT name FROM services WHERE id = tickets.id_service) AS service_name`;
  return new Promise((resolve, reject) => {
    // serialize runs the two statements one right after the other, with no
    // other query in between.
    db.serialize(() => {
      db.run(closeQuery, [counterId], (err) => {
        if (err) {
          reject(err);
        }
      });
      db.get(callQuery, [counterId, servedAt, counterId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  });
}

module.exports = {
  findCounterById,
  findServicesByCounter,
  callNextTicket,
};
