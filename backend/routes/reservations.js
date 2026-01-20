const express = require("express");
const controller = require("../controllers/reservationsController");

const router = express.Router();

router.post("/", controller.createReservation);
router.delete("/:id", controller.deleteReservation);
router.get("/:room", controller.getReservationsByRoom);

module.exports = router;
