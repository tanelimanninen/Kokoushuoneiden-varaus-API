const db = require("../data/inMemoryDb");
const { reservations } = db;

// Poista yksittäinen varaus
function deleteReservation(id) {
  // Haetaan tietokannasta parametria vastaava varausobjektin id-kenttä
  const index = reservations.findIndex(r => r.id === id);

  // Jos varausta ei löydy
  if (index === -1) {
    // Palautetaan virheviesti
    throw new Error("Varausta ei löytynyt");
  }

  // Poistetaan varaus tietokannasta annetun indeksin perusteella
  reservations.splice(index, 1);
};

module.exports = deleteReservation;