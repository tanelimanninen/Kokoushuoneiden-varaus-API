const service = require("../services/reservationService");

/* Luodaan POST-pyyntö osoitteessa /api/reservations */
exports.createReservation = (req, res) => {
  try {
    // Kutsutaan sevice-funktiota
    const reservation = service.createReservation(req.body);
    // Palautetaan varaus status-koodilla 201 (created)
    res.status(201).json(reservation);
  } catch (err) {
    // Palautetaan status-koodilla 400 (bad request) ja virheilmoitus
    res.status(400).json({ error: err.message });
  }
};

/* Luodaan DELETE-pyyntö osoitteessa /api/reservations/:id */
exports.deleteReservation = (req, res) => {
  try {
    // Kutsutaan sevice-funktiota
    service.deleteReservation(Number(req.params.id));
    // Palautetaan varaus status-koodilla 204 (no content)
    res.status(204).send();
  } catch (err) {
    // Palautetaan status-koodilla 404 (not found) ja virheilmoitus
    res.status(404).json({ error: err.message });
  }
};

/* Luodaan GET-pyyntö osoitteeseen /api/reservations/:room */
exports.getReservationsByRoom = (req, res) => {
  // Kutsutaan sevice-funktiota
  const reservations = service.getReservationsByRoom(req.params.room);
  // Palautetaan varaukset JSON-muodossa
  res.json(reservations);
};