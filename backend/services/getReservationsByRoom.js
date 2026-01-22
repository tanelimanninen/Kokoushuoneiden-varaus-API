const db = require("../data/inMemoryDb");
const validateRoom = require("../utils/validateRoom");
const { reservations } = db;

// FUNKTIO 3: Hae annetun huoneen varaukset
function getReservationsByRoom(room) {
  // VALIDOINTI 1: Annettu huone löytyy tietokannasta
  validateRoom(room);

  // Haetaan tietokannasta huonekohtaiset varaukset
  const roomReservations = reservations.filter(r => r.room === room);

  // Palautetaan annetun huoneen varaukset
  return roomReservations;
};

module.exports = getReservationsByRoom;