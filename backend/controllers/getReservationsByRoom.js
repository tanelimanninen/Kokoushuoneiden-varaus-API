const service = require("../services");

/* Luodaan GET-pyyntö osoitteeseen /api/reservations/:room */
function getReservationsByRoom(req, res) {
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
}

module.exports = getReservationsByRoom;