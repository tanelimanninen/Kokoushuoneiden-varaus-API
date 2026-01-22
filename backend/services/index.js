// Koontitiedosto servicefunktioille
const createReservation = require("./createReservation");
const getReservationsByRoom = require("./getReservationsByRoom");
const deleteReservation = require("./deleteReservation");

module.exports = {
  createReservation,
  getReservationsByRoom,
  deleteReservation
};
