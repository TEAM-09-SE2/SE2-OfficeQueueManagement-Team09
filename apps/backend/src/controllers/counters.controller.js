const countersService = require("../services/counters.service");


async function getServingTickets(req, res, next){
    res.locals.internalErrorMessage = "Internal server error occurred while retrieving current counter status.";
    try{
        const servingTickets = await countersService.getServingTickets();
        res.json(servingTickets);
    }
    catch(err){
        next(err);
    }
}


module.exports = {getServingTickets};