const db = require("./connection");

// Codes of the tickets of a service that are still waiting or being served:
// these codes must not be given to a new ticket.
function findActiveTicketCodes(serviceId) {
  const query = `SELECT code FROM tickets
     WHERE id_service = ? AND status IN ('WAITING', 'SERVING')`;
  return new Promise((resolve, reject) => {
    db.all(query, [serviceId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map((row) => row.code));
      }
    });
  });
}

/* Saves a new WAITING ticket and records its number as the last one issued
 by the service on ticketDate.

 The ticket is inserted first. If updating the service then fails, the ticket
 is still returned: its code stays in use while it waits, so the next ticket
 skips this number and no code is given twice.
 */
function createTicket(serviceId, code, number, issueAt, ticketDate) {
  const insertQuery = `INSERT INTO tickets (id_service, code, status, issue_at)
     VALUES (?, ?, 'WAITING', ?)
     RETURNING id, code, id_service, id_counter, issue_at, served_at, status`;
  const updateQuery = `UPDATE services
     SET current_number = ?, last_ticket_date = ?
     WHERE id = ?`;
  return new Promise((resolve, reject) => {
    db.get(insertQuery, [serviceId, code, issueAt], (err, ticket) => {
      if (err) {
        reject(err);
        return;
      }
      db.run(updateQuery, [number, ticketDate, serviceId], (err) => {
        if (err) {
          console.error(err);
        }
        resolve(ticket);
      });
    });
  });
}

module.exports = {
  findActiveTicketCodes,
  createTicket,
};
