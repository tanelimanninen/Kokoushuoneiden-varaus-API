const service = require("../services");

/* Luodaan POST-pyyntö osoitteessa /api/reservations */
function createReservation(req, res) {
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
}

module.exports = createReservation;