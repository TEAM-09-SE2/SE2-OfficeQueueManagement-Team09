const { describe, it, afterEach } = require("node:test");
const test = require("node:test");
const assert = require("node:assert/strict");

const servicesRepository = require("../../src/database/services.repository");
const ticketsRepository = require("../../src/database/tickets.repository");
const AppError = require("../../src/errors/AppError");
const {
  chooseTicketNumber,
  createTicket,
  formatTicketCode,
} = require("../../src/services/tickets.service");
const { officeDate } = require("../../src/utils/officeTime");

afterEach(() => {
  test.mock.reset();
});

describe("formatTicketCode_unit", () => {
  it("formats the numeric part on 3 digits", () => {
    assert.equal(formatTicketCode("A", 7), "A007");
    assert.equal(formatTicketCode("C", 123), "C123");
  });
});

describe("chooseTicketNumber_unit", () => {
  it("continues from the last number of the same day and skips in-use codes", () => {
    const service = {
      code: "A",
      current_number: 2,
      last_ticket_date: "2026-10-12",
    };

    const number = chooseTicketNumber(
      service,
      "2026-10-12",
      new Set(["A003"]),
    );

    assert.equal(number, 4);
  });

  it("restarts from 000 when the stored date is not today", () => {
    const service = {
      code: "B",
      current_number: 250,
      last_ticket_date: "2026-10-11",
    };

    const number = chooseTicketNumber(service, "2026-10-12", new Set());

    assert.equal(number, 0);
  });

  it("returns null when all numbers are already in use", () => {
    const service = {
      code: "C",
      current_number: 998,
      last_ticket_date: "2026-10-12",
    };
    const allCodes = new Set(
      Array.from({ length: 1000 }, (_, i) => formatTicketCode("C", i)),
    );

    const number = chooseTicketNumber(service, "2026-10-12", allCodes);

    assert.equal(number, null);
  });
});

describe("createTicket_unit", () => {
  it("creates a WAITING ticket with the next available code", async () => {
    const serviceId = 1;
    const today = officeDate(new Date());
    const service = {
      id: serviceId,
      code: "A",
      current_number: 2,
      last_ticket_date: today,
      counters_count: 2,
    };
    const expectedTicket = {
      id: 999,
      code: "A004",
      id_service: serviceId,
      id_counter: null,
      status: "WAITING",
      issue_at: "2026-10-12T09:00:00Z",
      served_at: null,
    };

    const findServiceByIdMock = test.mock.method(
      servicesRepository,
      "findServiceById",
      async () => service,
    );
    const findActiveTicketCodesMock = test.mock.method(
      ticketsRepository,
      "findActiveTicketCodes",
      async () => ["A003"],
    );
    const createTicketRepositoryMock = test.mock.method(
      ticketsRepository,
      "createTicket",
      async () => expectedTicket,
    );

    const result = await createTicket(serviceId);

    assert.deepStrictEqual(result, expectedTicket);
    assert.equal(findServiceByIdMock.mock.callCount(), 1);
    assert.equal(findActiveTicketCodesMock.mock.callCount(), 1);
    assert.equal(createTicketRepositoryMock.mock.callCount(), 1);

    const repositoryCall = createTicketRepositoryMock.mock.calls[0].arguments;
    assert.equal(repositoryCall[0], serviceId);
    assert.equal(repositoryCall[1], "A004");
    assert.equal(repositoryCall[2], 4);
    assert.match(repositoryCall[3], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(repositoryCall[4], today);
  });

  it("rejects with SERVICE_NOT_FOUND when the service does not exist", async () => {
    const serviceId = 999;

    const findServiceByIdMock = test.mock.method(
      servicesRepository,
      "findServiceById",
      async () => null,
    );
    const findActiveTicketCodesMock = test.mock.method(
      ticketsRepository,
      "findActiveTicketCodes",
      async () => [],
    );

    await assert.rejects(
      () => createTicket(serviceId),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.status, 404);
        assert.equal(error.code, "SERVICE_NOT_FOUND");
        assert.equal(error.message, "Service not found.");
        return true;
      },
    );

    assert.equal(findServiceByIdMock.mock.callCount(), 1);
    assert.equal(findActiveTicketCodesMock.mock.callCount(), 0);
  });

  it("rejects with SERVICE_NOT_AVAILABLE when no counter handles the service", async () => {
    const serviceId = 10;

    const findServiceByIdMock = test.mock.method(
      servicesRepository,
      "findServiceById",
      async () => ({
        id: serviceId,
        code: "J",
        current_number: 1,
        last_ticket_date: officeDate(new Date()),
        counters_count: 0,
      }),
    );

    await assert.rejects(
      () => createTicket(serviceId),
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

    assert.equal(findServiceByIdMock.mock.callCount(), 1);
  });

  it("rejects with QUEUE_FULL when all ticket numbers are already active", async () => {
    const serviceId = 1;
    const today = officeDate(new Date());

    test.mock.method(servicesRepository, "findServiceById", async () => ({
      id: serviceId,
      code: "A",
      current_number: 998,
      last_ticket_date: today,
      counters_count: 1,
    }));
    test.mock.method(ticketsRepository, "findActiveTicketCodes", async () =>
      Array.from({ length: 1000 }, (_, i) => formatTicketCode("A", i)),
    );
    const createTicketRepositoryMock = test.mock.method(
      ticketsRepository,
      "createTicket",
      async () => ({}),
    );

    await assert.rejects(
      () => createTicket(serviceId),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.status, 409);
        assert.equal(error.code, "QUEUE_FULL");
        assert.equal(
          error.message,
          "The queue for this service is full. Please try again later.",
        );
        return true;
      },
    );

    assert.equal(createTicketRepositoryMock.mock.callCount(), 0);
  });
});
