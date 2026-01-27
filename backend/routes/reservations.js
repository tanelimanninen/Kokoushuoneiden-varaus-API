const express = require("express");
const controller = require("../controllers");

// Luodaan router-muuttuja
const router = express.Router();

// Reititetään pyynnöt omiin controller-funktioihinsa
router.post("/", controller.createReservation);
router.delete("/:id", controller.deleteReservation);
router.get("/:room", controller.getReservationsByRoom);

module.exports = router;
