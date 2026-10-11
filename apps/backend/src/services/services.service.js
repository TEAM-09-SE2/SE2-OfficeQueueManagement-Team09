const servicesRepository = require("../database/services.repository");

// Returns every service with the ids of the counters that handle it. An empty
// counter_list means no counter handles the service.
async function getServices() {
  const rows = await servicesRepository.findServicesWithCounters();
  const services = new Map();
  for (const row of rows) {
    if (!services.has(row.id)) {
      services.set(row.id, {
        id: row.id,
        name: row.name,
        processing_time: row.processing_time,
        counter_list: [],
      });
    }
    if (row.id_counter !== null) {
      services.get(row.id).counter_list.push(row.id_counter);
    }
  }
  return [...services.values()];
}

module.exports = { getServices };
