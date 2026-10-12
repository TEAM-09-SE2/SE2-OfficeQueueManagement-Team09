const { afterEach, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");

const db = require("../../src/database/connection");
const AppError = require("../../src/errors/AppError");
const { createTicket } = require("../../src/services/tickets.service");

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(row);
      }
    });
  });
}

beforeEach(async () => {
  await run("BEGIN");
});

afterEach(async () => {
  await run("ROLLBACK");
});

describe("createTicket_integration", () => {
  it("stores a WAITING ticket with issue time and increments the service queue", async () => {
    const serviceId = 1;
    const before = await get(
      "SELECT COUNT(*) AS count FROM tickets WHERE id_service = ? AND status = 'WAITING'",
      [serviceId],
    );

    const ticket = await createTicket(serviceId);

    assert.equal(ticket.id_service, serviceId);
    assert.equal(ticket.status, "WAITING");
    assert.match(ticket.code, /^A\d{3}$/);
    assert.match(ticket.issue_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    const stored = await get(
      "SELECT id, id_service, code, status, issue_at FROM tickets WHERE id = ?",
      [ticket.id],
    );
    assert.equal(stored.id_service, serviceId);
    assert.equal(stored.code, ticket.code);
    assert.equal(stored.status, "WAITING");
    assert.ok(stored.issue_at);

    const after = await get(
      "SELECT COUNT(*) AS count FROM tickets WHERE id_service = ? AND status = 'WAITING'",
      [serviceId],
    );
    assert.equal(after.count, before.count + 1);
  });

  it("rejects with SERVICE_NOT_FOUND for an unknown service", async () => {
    await assert.rejects(
      () => createTicket(99999),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.status, 404);
        assert.equal(error.code, "SERVICE_NOT_FOUND");
        assert.equal(error.message, "Service not found.");
        return true;
      },
    );
  });

  it("rejects with SERVICE_NOT_AVAILABLE when the service has no counters", async () => {
    await assert.rejects(
      () => createTicket(10),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.status, 409);
        assert.equal(error.code, "SERVICE_NOT_AVAILABLE");
        assert.equal(
          error.message,
          "This service is not handled by any counter.",
        );
        return true;
      },
    );
  });

  it("never generates duplicate ticket codes when creating many tickets", async () => {
    const serviceIds = [1, 1, 2, 3, 2];

    const tickets = [];
    for (const serviceId of serviceIds) {
      tickets.push(await createTicket(serviceId));
    }

    const codes = tickets.map((ticket) => ticket.code);
    assert.equal(new Set(codes).size, codes.length);

    assert.match(tickets[0].code, /^A\d{3}$/);
    assert.match(tickets[1].code, /^A\d{3}$/);
    assert.match(tickets[2].code, /^C\d{3}$/);
    assert.match(tickets[3].code, /^F\d{3}$/);
    assert.match(tickets[4].code, /^C\d{3}$/);
  });
});
