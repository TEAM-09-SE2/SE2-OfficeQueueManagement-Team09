import { apiRequest } from "./client";

// POST /api/tickets: issues a ticket for the service and returns it
// ({ id, code, id_service, status, ... }).
export function createTicket(serviceId) {
  return apiRequest("/api/tickets", {
    method: "POST",
    data: { id_service: serviceId },
  });
}
