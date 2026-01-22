const db = require("../data/inMemoryDb");
const { isOverlapping } = require("../utils/timeUtils");
const { rooms, reservations } = db;

/* FUNKTIO 2: Poista yksittäinen varaus */
exports.deleteReservation = (id) => {
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

/* FUNKTIO 3: Hae annetun huoneen varaukset */
exports.getReservationsByRoom = (room) => {
  // VALIDOINTI 1: Annettu huone löytyy tietokannasta
  validateRoom(room);

  // Haetaan tietokannasta huonekohtaiset varaukset
  const roomReservations = reservations.filter(r => r.room === room);

  // Palautetaan annetun huoneen varaukset
  return roomReservations;
};