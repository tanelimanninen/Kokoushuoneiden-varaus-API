const db = require("../data/inMemoryDb");
const { isOverlapping } = require("../utils/timeUtils");
const { rooms, reservations } = db;

/* FUNKTIO 3: Hae annetun huoneen varaukset */
exports.getReservationsByRoom = (room) => {
  // VALIDOINTI 1: Annettu huone löytyy tietokannasta
  validateRoom(room);

  // Haetaan tietokannasta huonekohtaiset varaukset
  const roomReservations = reservations.filter(r => r.room === room);

  // Palautetaan annetun huoneen varaukset
  return roomReservations;
};