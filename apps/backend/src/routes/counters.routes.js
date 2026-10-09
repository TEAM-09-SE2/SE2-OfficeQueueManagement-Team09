const express = require("express");
const countersController = require("../controllers/counters.controller");

const router = express.Router();

router.get("/:id/services", countersController.getCounterServices);
router.post("/:id/next", countersController.callNextCustomer);

module.exports = router;
