const service = require("../services");

/* Luodaan POST-pyyntö osoitteessa /api/reservations */
exports.createReservation = (req, res) => {
  try {
    // Kutsutaan sevice-funktiota
    const reservation = service.createReservation(req.body);
    // Tulostetaan terminaaliin
    console.log(`[POST] - Varauksen luonti onnistui, id: ${reservation.id}`);
    // Palautetaan varaus status-koodilla 201 (created)
    res.status(201).json(reservation);
  } catch (err) {
    // Tulostetaan terminaaliin
    console.error(`[POST] - Varauksen luonti epäonnistui:`, err.message);
    // Palautetaan status-koodilla 400 (bad request) ja virheilmoitus
    res.status(400).json({ error: err.message });
  }
};

/* Luodaan DELETE-pyyntö osoitteessa /api/reservations/:id */
exports.deleteReservation = (req, res) => {
  try {
    // Kutsutaan sevice-funktiota
    service.deleteReservation(Number(req.params.id));
    // Tulostetaan terminaaliin
    console.log(`[DELETE] - Varauksen poisto onnistui, id: ${req.params.id}`);
    // Palautetaan varaus status-koodilla 204 (no content)
    res.status(204).send();
  } catch (err) {
    // Tulostetaan terminaaliin
    console.error(`[DELETE] - Varauksen luonti epäonnistui:`, err.message);
    // Palautetaan status-koodilla 404 (not found) ja virheilmoitus
    res.status(404).json({ error: err.message });
  }
};

/* Luodaan GET-pyyntö osoitteeseen /api/reservations/:room */
exports.getReservationsByRoom = (req, res) => {
  try {
    // Kutsutaan sevice-funktiota
    const reservations = service.getReservationsByRoom(req.params.room);
    // Tulostetaan terminaaliin
    console.log(`[GET] - Varausten haku onnistui: /api/reservations/${req.params.room}`);
    // Palautetaan varaukset JSON-muodossa
    res.json(reservations);
  } catch (err) {
    // Tulostetaan terminaaliin
    console.error(`[GET] - Varausten haku epäonnistui: /api/reservations/${req.params.room}`, err.message);
    // Palautetaan status-koodilla 400 (bad request) ja virheilmoitus
    res.status(400).json({ error: err.message });
  }
};