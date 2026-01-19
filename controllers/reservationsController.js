const service = require("../services/reservationService");

/* POST /api/reservations */
exports.createReservation = (req, res) => {
  try {
    const reservation = service.createReservation(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* DELETE /api/reservations/:id */
exports.deleteReservation = (req, res) => {
  try {
    service.deleteReservation(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/* GET /api/reservations/:room */
exports.getReservationsByRoom = (req, res) => {
  const reservations = service.getReservationsByRoom(req.params.room);
  res.json(reservations);
};