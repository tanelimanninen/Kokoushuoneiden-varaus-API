// Koontitiedosto controller-funktioille
const createReservation = require("./createReservation");
const deleteReservation = require("./deleteReservation");
const getReservationsByRoom = require("./getReservationsByRoom");

module.exports = {
  createReservation,
  getReservationsByRoom,
  deleteReservation
};