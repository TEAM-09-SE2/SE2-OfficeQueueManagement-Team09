const { afterEach, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");

const db = require("../../src/database/connection");
const {
  AppError,
  callNextCustomer,
  getCounterServices,
} = require("../../src/services/counters.service");

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

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

// Each test uses the backend database but rolls back its changes to preserve populate.sql data.
beforeEach(async () => {
  await run("BEGIN");
});

afterEach(async () => {
  await run("ROLLBACK");
});

// getCounterServices tests
describe("getCounterServices_integration", () => {
  // Test 1
  // Data: Counter 1 and its services from populate.sql.
  // Mocks: none
  it("returns the services associated with the counter in ID order", async () => {
    // Test
    const result = await getCounterServices(1);

    // Asserts
    assert.deepStrictEqual(result, [
      { id: 1, name: "Parcel Shipping", processing_time: 5 },
      { id: 2, name: "Bill Payment", processing_time: 3 },
      { id: 3, name: "Registered Mail Pickup", processing_time: 4 },
      { id: 7, name: "Digital ID Issuance", processing_time: 8 },
    ]);
  });

  // Test 2
  // Data: Counter 1 has its seeded service associations removed in this transaction.
  // Mocks: none
  it("returns an empty array when an existing counter has no services", async () => {
    // Data
    const counterId = 1;
    await run("DELETE FROM counters_services WHERE id_counter = ?", [counterId]);

    // Test
    const result = await getCounterServices(counterId);

    // Asserts
    assert.deepStrictEqual(result, []);
  });

  // Test 3
  // Data: Counter ID 999 is not present in populate.sql.
  // Mocks: none
  it("rejects with COUNTER_NOT_FOUND when the counter does not exist", async () => {
    // Data
    const counterId = 999;

    // Test
    await assert.rejects(
      () => getCounterServices(counterId),
      (error) => {
        // Asserts
        assert.ok(error instanceof AppError);
        assert.equal(error.status, 404);
        assert.equal(error.code, "COUNTER_NOT_FOUND");
        assert.equal(error.message, "Counter not found.");
        return true;
      },
    );
  });
});

// callNextCustomer tests
describe("callNextCustomer_integration", () => {
  // Test 1
  // Data: waiting queues use Counter 1's services from populate.sql.
  // Mocks: none
  it("calls the oldest ticket from the longest eligible queue", async () => {
    // Data
    const counterId = 1;
    await run(
      `DELETE FROM tickets
       WHERE status = 'WAITING'
         AND id_service IN (
           SELECT id_service FROM counters_services WHERE id_counter = ?
         )`,
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

    // Test
    const result = await callNextCustomer(counterId);

    // Asserts
    assert.equal(result.id, firstTicket.lastID);
    assert.equal(result.code, "A201");
    assert.equal(result.id_service, 1);
    assert.equal(result.id_counter, counterId);
    assert.equal(result.service_name, "Parcel Shipping");
    assert.equal(result.status, "SERVING");
    assert.match(result.served_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  // Test 2
  // Data: Seeded waiting tickets are replaced within the transaction with tied queues.
  // Mocks: none
  it("breaks equal queue lengths by processing time and then service ID", async () => {
    // Data
    const counterId = 1;
    await run(
      `DELETE FROM tickets
       WHERE status = 'WAITING'
         AND id_service IN (
           SELECT id_service FROM counters_services WHERE id_counter = ?
         )`,
      [counterId],
    );
    await run("UPDATE services SET processing_time = 3 WHERE id = 3");
    await run(
      `INSERT INTO tickets (id_service, code, status, issue_at)
       VALUES
         (2, 'C201', 'WAITING', '2026-10-10T09:00:00Z'),
         (2, 'C202', 'WAITING', '2026-10-10T09:01:00Z'),
         (3, 'F201', 'WAITING', '2026-10-10T09:02:00Z'),
         (3, 'F202', 'WAITING', '2026-10-10T09:03:00Z')`,
    );

    // Test
    const result = await callNextCustomer(counterId);

    // Asserts
    assert.equal(result.id_service, 2);
    assert.equal(result.code, "C201");
    assert.equal(result.service_name, "Bill Payment");
  });

  // Test 3
  // Data: Counter 2's seeded waiting tickets are removed and an in-service ticket is added.
  // Mocks: none
  it("returns null when no ticket is waiting and closes the current ticket", async () => {
    // Data
    const counterId = 2;
    const serviceId = 4;
    await run(
      "UPDATE tickets SET status = 'SERVED' WHERE id_service = ? AND status = 'WAITING'",
      [serviceId],
    );
    const inserted = await run(
      `INSERT INTO tickets (id_counter, id_service, code, status, issue_at, served_at)
       VALUES (?, ?, 'B999', 'SERVING', '2026-10-10T09:00:00Z', '2026-10-10T09:01:00Z')`,
      [counterId, serviceId],
    );

    // Test
    const result = await callNextCustomer(counterId);
    const currentTicket = (
      await all("SELECT status FROM tickets WHERE id = ?", [inserted.lastID])
    )[0];

    // Asserts
    assert.equal(result, null);
    assert.equal(currentTicket.status, "SERVED");
  });

  // Test 4
  // Data: Counter ID 999 is not present in populate.sql.
  // Mocks: none
  it("rejects with COUNTER_NOT_FOUND when the counter does not exist", async () => {
    // Data
    const counterId = 999;

    // Test
    await assert.rejects(
      () => callNextCustomer(counterId),
      (error) => {
        // Asserts
        assert.ok(error instanceof AppError);
        assert.equal(error.status, 404);
        assert.equal(error.code, "COUNTER_NOT_FOUND");
        assert.equal(error.message, "Counter not found.");
        return true;
      },
    );
  });
});
