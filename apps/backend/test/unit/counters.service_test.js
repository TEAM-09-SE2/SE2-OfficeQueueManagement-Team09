const { describe, it, afterEach } = require("node:test");
const test = require("node:test");
const assert = require("node:assert/strict");

const countersRepository = require("../../src/database/counters.repository");
const {getCounterServices, callNextCustomer, AppError } = require("../../src/services/counters.service");

//Clear all the mocks before starting each test
afterEach(() => {
    test.mock.reset();
});


//getCounterServices tests
describe("getCounterServices_unit", () => {
    //Test 1
  it("returns the services with processing_time when the counter exists", async () => {
    //Data
    const counterId = 1;
    const expectedServices = [
      {
        id: 1,
        name: "shipping",
        processing_time: 5,
      },
      {
        id: 2,
        name: "accounts",
        processing_time: 3,
      },
    ];

    //Mocks
    //findCounterById
    const findCounterByIdMock = test.mock.method(
      countersRepository,
      "findCounterById",
      async (id) => ({ id })
    );

    //findServicesByCounter
    const findServicesByCounterMock = test.mock.method(
      countersRepository,
      "findServicesByCounter",
      async () => expectedServices
    );

    //Test
    const result = await getCounterServices(counterId);

    //Asserts
    assert.deepStrictEqual(result, expectedServices);

    assert.equal(findCounterByIdMock.mock.callCount(), 1);
    assert.deepStrictEqual(findCounterByIdMock.mock.calls[0].arguments, [counterId]);

    assert.equal(findServicesByCounterMock.mock.callCount(), 1);
    assert.deepStrictEqual(findServicesByCounterMock.mock.calls[0].arguments, [counterId]);
  });

  //Test 2
  it("rejects with 404 COUNTER_NOT_FOUND when the counter does not exist", async () => {
    //Data
    const nonExistentId = 999;

    //Mocks
    //findCounterById
    const findCounterByIdMock = test.mock.method(
      countersRepository,
      "findCounterById",
      async () => null
    );

    //findServicesByCounter
    const findServicesByCounterMock = test.mock.method(
      countersRepository,
      "findServicesByCounter",
      async () => []
    );

    //Test
    await assert.rejects(
      () => getCounterServices(nonExistentId),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.status, 404);
        assert.equal(error.code, "COUNTER_NOT_FOUND");
        assert.equal(error.message, "Counter not found.");
        return true;
      }
    );

    //Asserts
    assert.equal(findCounterByIdMock.mock.callCount(), 1);
    assert.deepStrictEqual(findCounterByIdMock.mock.calls[0].arguments, [nonExistentId]);

    assert.equal(findServicesByCounterMock.mock.callCount(), 0);
  });

  //Test 3
  it("propagates unexpected repository errors for 500 handling", async () => {
    //Data
    const counterId = 1;
    const dbError = new Error("Database query failed");

    //Mocks
    //findCounterById
    const findCounterByIdMock = test.mock.method(
      countersRepository,
      "findCounterById",
      async (id) => ({ id })
    );

    //findServicesByCounter
    const findServicesByCounterMock = test.mock.method(
      countersRepository,
      "findServicesByCounter",
      async () => {
        throw dbError;
      }
    );

    //Test
    await assert.rejects(
      () => getCounterServices(counterId),
      dbError
    );

    //Asserts
    assert.equal(findCounterByIdMock.mock.callCount(), 1);
    assert.deepStrictEqual(findCounterByIdMock.mock.calls[0].arguments, [counterId]);

    assert.equal(findServicesByCounterMock.mock.callCount(), 1);
    assert.deepStrictEqual(findServicesByCounterMock.mock.calls[0].arguments, [counterId]);
  });
});


//callNextCustomer
describe("callNextCustomer_unit", () => {
    //Test 1
  it("returns the called ticket when a ticket is available", async () => {
    //Data
    const counterId = 1;
    const expectedTicket = {
      id: 101,
      ticketNumber: "A01",
      counterId: 1,
      servedAt: "2026-10-10T16:30:00Z",
    };

    //Mocks
    //findCounterById
    const findCounterByIdMock = test.mock.method(
      countersRepository,
      "findCounterById",
      async (id) => ({ id })
    );

    //callNextTicket
    const callNextTicketMock = test.mock.method(
      countersRepository,
      "callNextTicket",
      async () => expectedTicket
    );

    //Test
    const result = await callNextCustomer(counterId);

    //Asserts
    assert.deepStrictEqual(result, expectedTicket);

    assert.equal(findCounterByIdMock.mock.callCount(), 1);
    assert.deepStrictEqual(findCounterByIdMock.mock.calls[0].arguments, [counterId]);

    assert.equal(callNextTicketMock.mock.callCount(), 1);
    assert.equal(callNextTicketMock.mock.calls[0].arguments[0], counterId);
    assert.match(
      callNextTicketMock.mock.calls[0].arguments[1],
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });

  //Test 2
  it("returns null when no customers are in line (ticket is null or undefined)", async () => {
    //Data
    const counterId = 1;

    //Mocks
    //findCounterById
    const findCounterByIdMock = test.mock.method(
      countersRepository,
      "findCounterById",
      async (id) => ({ id })
    );

    //callNextTicket
    const callNextTicketMock = test.mock.method(
      countersRepository,
      "callNextTicket",
      async () => undefined
    );

    //Test
    const result = await callNextCustomer(counterId);

    //Asserts
    assert.equal(result, null);

    assert.equal(findCounterByIdMock.mock.callCount(), 1);
    assert.deepStrictEqual(findCounterByIdMock.mock.calls[0].arguments, [counterId]);

    assert.equal(callNextTicketMock.mock.callCount(), 1);
    assert.equal(callNextTicketMock.mock.calls[0].arguments[0], counterId);
  });

  //Test 3
  it("rejects with AppError 404 and does not call next ticket when counter does not exist", async () => {
    //Data
    const nonExistentId = 999;

    //Mocks
    //findCounterById
    const findCounterByIdMock = test.mock.method(
      countersRepository,
      "findCounterById",
      async () => null
    );

    //callNextTicket
    const callNextTicketMock = test.mock.method(
      countersRepository,
      "callNextTicket",
      async () => null
    );

    //Test
    await assert.rejects(
      () => callNextCustomer(nonExistentId),
      (error) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.status, 404);
        assert.equal(error.code, "COUNTER_NOT_FOUND");
        assert.equal(error.message, "Counter not found.");
        return true;
      }
    );

    //Asserts
    assert.equal(findCounterByIdMock.mock.callCount(), 1);
    assert.deepStrictEqual(findCounterByIdMock.mock.calls[0].arguments, [nonExistentId]);

    assert.equal(callNextTicketMock.mock.callCount(), 0);
  });

  //Test 4
  it("propagates unexpected errors when repository fails during callNextTicket", async () => {
    //Data
    const counterId = 1;
    const dbError = new Error("Database transaction failed");

    //Mocks
    //findCounterById
    const findCounterByIdMock = test.mock.method(
      countersRepository,
      "findCounterById",
      async (id) => ({ id })
    );

    //callNextTicket
    const callNextTicketMock = test.mock.method(
      countersRepository,
      "callNextTicket",
      async () => {
        throw dbError;
      }
    );

    //Test
    await assert.rejects(
      () => callNextCustomer(counterId),
      dbError
    );

    //Asserts
    assert.equal(findCounterByIdMock.mock.callCount(), 1);
    assert.equal(callNextTicketMock.mock.callCount(), 1);
  });
});

