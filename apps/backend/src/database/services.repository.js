const db = require("./connection");

// Both queries join counters to ignore links to counters that no longer exist:
// foreign keys are not enforced, so deleting a counter leaves its links behind.

// One row per (service, counter) pair. A service that no counter handles
// appears once, with id_counter NULL.
function findServicesWithCounters() {
  const query = `SELECT DISTINCT s.id, s.name, s.processing_time, c.id AS id_counter
     FROM services s
     LEFT JOIN counters_services cs ON cs.id_service = s.id
     LEFT JOIN counters c ON c.id = cs.id_counter
     ORDER BY s.id, id_counter`;
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function findServiceById(serviceId) {
  const query = `SELECT s.id, s.code, s.current_number, s.last_ticket_date,
       COUNT(c.id) AS counters_count
     FROM services s
     LEFT JOIN counters_services cs ON cs.id_service = s.id
     LEFT JOIN counters c ON c.id = cs.id_counter
     WHERE s.id = ?
     GROUP BY s.id`;
  return new Promise((resolve, reject) => {
    db.get(query, [serviceId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  findServicesWithCounters,
  findServiceById,
};
