const express = require("express");
const countersController = require("../controllers/counters.controller.js");

const router = express.Router();

//GET /api/counters/current 
router.get("/current", countersController.getServingTickets);

module.exports = router;

