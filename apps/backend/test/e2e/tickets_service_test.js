const { after, afterEach, before, beforeEach, describe, it } = require("node:test");
const test = require("node:test");
const assert = require("node:assert/strict");

const app = require("../../src/app");
const db = require("../../src/database/connection");
const ticketsRepository = require("../../src/database/tickets.repository");

let server;
let servicesUrl;
let ticketsUrl;

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
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  servicesUrl = `${baseUrl}/services`;
  ticketsUrl = `${baseUrl}/tickets`;
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
  test.mock.reset();
  await run("ROLLBACK");
});

describe("GET /api/services", () => {
  it("returns the full services list with correct names and processing times", async () => {
    const expected = [
      {
        id: 1,
        name: "Parcel Shipping",
        processing_time: 5,
        counter_list: [1, 6],
      },
      {
        id: 2,
        name: "Bill Payment",
        processing_time: 3,
        counter_list: [1],
      },
      {
        id: 3,
        name: "Registered Mail Pickup",
        processing_time: 4,
        counter_list: [1],
      },
      {
        id: 4,
        name: "Change of Address",
        processing_time: 10,
        counter_list: [2],
      },
      {
        id: 5,
        name: "Account Opening",
        processing_time: 15,
        counter_list: [3],
      },
      {
        id: 6,
        name: "Mortgage Consultation",
        processing_time: 20,
        counter_list: [3],
      },
      {
        id: 7,
        name: "Digital ID Issuance",
        processing_time: 8,
        counter_list: [1],
      },
      {
        id: 8,
        name: "ID Card Request",
        processing_time: 6,
        counter_list: [4],
      },
      {
        id: 9,
        name: "General Information",
        processing_time: 2,
        counter_list: [5, 6],
      },
      {
        id: 10,
        name: "Historical Archives",
        processing_time: 12,
        counter_list: [],
      },
    ];

    const response = await fetch(servicesUrl);

    assert.equal(response.status, 200);
    assert.deepStrictEqual(await response.json(), expected);
  });
});

describe("POST /api/tickets", () => {
  it("creates a ticket, stores it as WAITING and increases the queue by one", async () => {
    const serviceId = 1;
    const before = await get(
      "SELECT COUNT(*) AS count FROM tickets WHERE id_service = ? AND status = 'WAITING'",
      [serviceId],
    );

    const response = await fetch(ticketsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_service: serviceId }),
    });
    const ticket = await response.json();

    assert.equal(response.status, 201);
    assert.equal(ticket.id_service, serviceId);
    assert.equal(ticket.status, "WAITING");
    assert.match(ticket.code, /^A\d{3}$/);

    const stored = await get(
      "SELECT id, id_service, code, status, issue_at FROM tickets WHERE id = ?",
      [ticket.id],
    );
    assert.equal(stored.id_service, serviceId);
    assert.equal(stored.code, ticket.code);
    assert.equal(stored.status, "WAITING");
    assert.match(stored.issue_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    const after = await get(
      "SELECT COUNT(*) AS count FROM tickets WHERE id_service = ? AND status = 'WAITING'",
      [serviceId],
    );
    assert.equal(after.count, before.count + 1);
  });

  it("returns 404 for an unknown service id", async () => {
    const response = await fetch(ticketsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_service: 99999 }),
    });

    assert.equal(response.status, 404);
    assert.deepStrictEqual(await response.json(), {
      error: {
        code: "SERVICE_NOT_FOUND",
        message: "Service not found.",
      },
    });
  });

  it("returns 400 when id_service is missing", async () => {
    const response = await fetch(ticketsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 400);
    assert.deepStrictEqual(await response.json(), {
      error: {
        code: "INVALID_INPUT",
        message: "Invalid input: id_service must be a valid integer.",
      },
    });
  });

  it("returns 500 INTERNAL_SERVER_ERROR on database failure", async () => {
    test.mock.method(ticketsRepository, "createTicket", async () => {
      throw new Error("Database write failure");
    });

    const response = await fetch(ticketsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_service: 1 }),
    });

    assert.equal(response.status, 500);
    assert.deepStrictEqual(await response.json(), {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error occurred while creating the ticket.",
      },
    });
  });

  it("never returns duplicate codes when issuing many tickets", async () => {
    const serviceIds = [1, 1, 2, 3, 2];
    const tickets = [];

    for (const serviceId of serviceIds) {
      const response = await fetch(ticketsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_service: serviceId }),
      });
      assert.equal(response.status, 201);
      tickets.push(await response.json());
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
