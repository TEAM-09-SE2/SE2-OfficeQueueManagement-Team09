const { after, afterEach, before, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../../src/app");
const db = require("../../src/database/connection");

let server;
let baseUrl;

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

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/counters`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
});

beforeEach(async () => {
  await run("BEGIN");
});

afterEach(async () => {
  await run("ROLLBACK");
});

describe("GET /api/counters/{id}/services", () => {
  it("returns the services associated with a counter", async () => {
    //Data
    const counterId = 1;
    const expectedServices = [
      { id: 1, name: "Parcel Shipping", processing_time: 5 },
      { id: 2, name: "Bill Payment", processing_time: 3 },
      { id: 3, name: "Registered Mail Pickup", processing_time: 4 },
      { id: 7, name: "Digital ID Issuance", processing_time: 8 },
    ];

    //Test
    const response = await fetch(`${baseUrl}/${counterId}/services`);

    //Asserts
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), expectedServices);
  });

  it("returns an empty array when the counter has no services", async () => {
    //Data
    const counterId = 1;
    await run("DELETE FROM counters_services WHERE id_counter = ?", [counterId]);

    //Test
    const response = await fetch(`${baseUrl}/${counterId}/services`);

    //Asserts
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  });

  it("returns 400 when the counter ID is invalid", async () => {
    //Data
    const invalidId = "invalid";
    const expectedError = {
      error: {
        code: "INVALID_INPUT",
        message: "Invalid counter ID supplied.",
      },
    };

    //Test
    const response = await fetch(`${baseUrl}/${invalidId}/services`);

    //Asserts
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), expectedError);
  });

  it("returns 404 when the counter does not exist", async () => {
    //Data
    const nonExistentId = 999;
    const expectedError = {
      error: { code: "COUNTER_NOT_FOUND", message: "Counter not found." },
    };

    //Test
    const response = await fetch(`${baseUrl}/${nonExistentId}/services`);

    //Asserts
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), expectedError);
  });
});

describe("POST /api/counters/{id}/next", () => {
  it("calls the oldest ticket from the longest eligible queue", async () => {
    //Data
    const counterId = 1;
    await run(
      `DELETE FROM tickets
       WHERE status = 'WAITING'
         AND id_service IN (
           SELECT id_service FROM counters_services WHERE id_counter = ?
         )`,
      [counterId],
    );
    const currentTicket = await run(
      `INSERT INTO tickets (id_counter, id_service, code, status, issue_at, served_at)
       VALUES (?, 1, 'A200', 'SERVING', '2026-10-10T08:59:00Z', '2026-10-10T09:00:00Z')`,
      [counterId],
    );
    const firstTicket = await run(
      `INSERT INTO tickets (id_service, code, status, issue_at)
       VALUES (1, 'A201', 'WAITING', '2026-10-10T09:00:00Z')`,
    );
    await run(
      `INSERT INTO tickets (id_service, code, status, issue_at)
       VALUES
         (1, 'A202', 'WAITING', '2026-10-10T09:01:00Z'),
         (2, 'C201', 'WAITING', '2026-10-10T09:02:00Z')`,
    );

    //Test
    const response = await fetch(`${baseUrl}/${counterId}/next`, { method: "POST" });
    const ticket = await response.json();

    //Asserts
    assert.equal(response.status, 200);
    assert.equal(ticket.id, firstTicket.lastID);
    assert.equal(ticket.code, "A201");
    assert.equal(ticket.id_service, 1);
    assert.equal(ticket.id_counter, 1);
    assert.equal(ticket.service_name, "Parcel Shipping");
    assert.equal(ticket.status, "SERVING");
    assert.match(ticket.served_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal((await get("SELECT status FROM tickets WHERE id = ?", [ticket.id])).status, "SERVING");
    assert.equal(
      (await get("SELECT status FROM tickets WHERE id = ?", [currentTicket.lastID])).status,
      "SERVED",
    );
  });

  it("breaks equal queue lengths by processing time and then service ID", async () => {
    //Data
    const counterId = 1;
    await run(
      `DELETE FROM tickets
       WHERE status = 'WAITING'
         AND id_service IN (
           SELECT id_service FROM counters_services WHERE id_counter = ?
         )`,
      [counterId],
    );
    await run("UPDATE services SET processing_time = 5 WHERE id = 2");
    await run("UPDATE services SET processing_time = 3 WHERE id IN (3, 7)");
    await run(
      `INSERT INTO tickets (id_service, code, status, issue_at)
       VALUES
         (2, 'C201', 'WAITING', '2026-10-10T09:00:00Z'),
         (3, 'F201', 'WAITING', '2026-10-10T09:01:00Z'),
         (7, 'I201', 'WAITING', '2026-10-10T09:02:00Z')`,
    );

    //Test
    const response = await fetch(`${baseUrl}/${counterId}/next`, { method: "POST" });
    const ticket = await response.json();

    //Asserts
    assert.equal(response.status, 200);
    assert.equal(ticket.id_service, 3);
    assert.equal(ticket.code, "F201");
  });

  it("returns 204 and closes the current ticket when no ticket is waiting", async () => {
    //Data
    const counterId = 2;
    await run(
      "UPDATE tickets SET status = 'SERVED' WHERE id_service = ? AND status = 'WAITING'",
      [4],
    );
    const currentTicket = await run(
      `INSERT INTO tickets (id_counter, id_service, code, status, issue_at, served_at)
       VALUES (2, 4, 'B999', 'SERVING', '2026-10-10T09:00:00Z', '2026-10-10T09:01:00Z')`,
    );

    //Test
    const response = await fetch(`${baseUrl}/${counterId}/next`, { method: "POST" });

    //Asserts
    assert.equal(response.status, 204);
    assert.equal(await response.text(), "");
    assert.equal(
      (await get("SELECT status FROM tickets WHERE id = ?", [currentTicket.lastID])).status,
      "SERVED",
    );
  });

  it("returns 404 when calling the next ticket for a missing counter", async () => {
    //Data
    const nonExistentId = 999;
    const expectedError = {
      error: { code: "COUNTER_NOT_FOUND", message: "Counter not found." },
    };

    //Test
    const response = await fetch(`${baseUrl}/${nonExistentId}/next`, { method: "POST" });

    //Asserts
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), expectedError);
  });

  it("returns 400 when the counter ID is invalid", async () => {
    //Data
    const invalidId = "invalid";
    const expectedError = {
      error: {
        code: "INVALID_INPUT",
        message: "Invalid counter ID supplied.",
      },
    };

    //Test
    const response = await fetch(`${baseUrl}/${invalidId}/next`, { method: "POST" });

    //Asserts
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), expectedError);
  });
});