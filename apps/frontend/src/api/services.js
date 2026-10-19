import { apiRequest } from "./client";

// GET /api/services: every service with the counters that handle it
// ({ id, name, processing_time, counter_list }).
export function getServices(signal) {
  return apiRequest("/api/services", { signal });
}
