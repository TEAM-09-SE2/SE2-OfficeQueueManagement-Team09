// Static copy of the GET /api/counters/current response.
// TODO: replace with the API call when the endpoint is available.
export const currentCalls = [
  { id_counter: 1, ticket_code: "A107", service_name: "Parcel Shipping" },
  { id_counter: 2, ticket_code: "B107", service_name: "Change of Address" },
  { id_counter: 3, ticket_code: "D104", service_name: "Account Opening" },
  { id_counter: 4, ticket_code: "E107", service_name: "ID Card Request" },
  { id_counter: 5, ticket_code: null, service_name: null },
  { id_counter: 6, ticket_code: "G108", service_name: "General Information" },
];

// Fake calls, only to see the board react while the API is missing.
const FAKE_COUNTER_ORDER = [5, 2, 6, 1, 4, 3];
const FAKE_SERVICES = [
  { code: "G", name: "General Information" },
  { code: "B", name: "Change of Address" },
  { code: "A", name: "Parcel Shipping" },
  { code: "C", name: "Bill Payment" },
];

// Returns the calls after fake call number `step` (1, 2, 3, ...): one counter
// gets a new ticket, the others stay as they are.
export function simulateCall(calls, step) {
  const counterId = FAKE_COUNTER_ORDER[(step - 1) % FAKE_COUNTER_ORDER.length];
  const service = FAKE_SERVICES[(step - 1) % FAKE_SERVICES.length];
  const ticketCode = `${service.code}${110 + step}`;

  return calls.map((call) =>
    call.id_counter === counterId
      ? { ...call, ticket_code: ticketCode, service_name: service.name }
      : call
  );
}
