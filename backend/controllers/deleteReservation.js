const service = require("../services");

/* Luodaan DELETE-pyyntö osoitteessa /api/reservations/:id */
function deleteReservation(req, res) {
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
}

module.exports = deleteReservation;