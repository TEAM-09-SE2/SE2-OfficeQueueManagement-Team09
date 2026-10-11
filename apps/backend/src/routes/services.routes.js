const express = require("express");
const servicesController = require("../controllers/services.controller");

const router = express.Router();

router.get("/", servicesController.getServices);

module.exports = router;
