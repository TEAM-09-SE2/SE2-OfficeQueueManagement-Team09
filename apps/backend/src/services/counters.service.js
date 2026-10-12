const countersRepository = require("../database/counters.repository");

async function getServingTickets(){
    const servingTickets = await countersRepository.getServingTickets()
    return servingTickets;
}

module.exports = {getServingTickets};