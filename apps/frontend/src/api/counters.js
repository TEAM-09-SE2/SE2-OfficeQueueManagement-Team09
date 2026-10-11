import { apiRequest } from "./client";

// GET /api/counters/{id}/services: the services the counter can handle.
export function getCounterServices(counterId, signal) {
  return apiRequest(`/api/counters/${encodeURIComponent(counterId)}/services`, {
    signal,
  });
}

// POST /api/counters/{id}/next: closes the ticket the counter is serving and
// calls the next one. Returns the called ticket, or null when nobody is waiting.
export function callNextCustomer(counterId) {
  return apiRequest(`/api/counters/${encodeURIComponent(counterId)}/next`, {
    method: "POST",
  });
}

// GET /api/counters/current (Call customer story): returns the ticket the
// counter is serving ({ code, service_name }), or null if it is free.
export async function getCurrentTicket(counterId, signal) {
  const calls = await apiRequest("/api/counters/current", { signal });
  const call = calls.find((c) => String(c.id_counter) === String(counterId));
  if (!call || call.ticket_code === null) {
    return null;
  }
  return { code: call.ticket_code, service_name: call.service_name };
}
