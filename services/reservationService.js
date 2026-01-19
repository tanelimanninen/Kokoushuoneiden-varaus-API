const db = require("../data/inMemoryDb");
const { isOverlapping } = require("../utils/timeUtils");

/* Luo uusi varaus */
exports.createReservation = ({ room, startTime, endTime }) => {
  // Validointi 1: tiedot puuttuvat
  if (!room || !startTime || !endTime) {
    throw new Error("Puuttuvat tiedot");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // Validointi 2: Aloitusaika on menneisyydessä
  if (start < now) {
    throw new Error("Varauksen aloitusaika ei voi olla menneessä");
  }

  // Validointi 3: Aloitusaika on ennen lopetusta
  if (start >= end) {
    throw new Error("Varauksen aloitusaika tulee olla ennen lopetusaikaa");
  }

  const overlapping = db.reservations.some(r =>
    r.room === room &&
    isOverlapping(startTime, endTime, r.startTime, r.endTime)
  );

  // Validointi 4: Varaus on päällekkäinen jo olemassa olevan varauksen kanssa
  if (overlapping) {
    throw new Error("Aikaväli on jo varattu");
  }

  const reservation = {
    id: db.nextId++,
    room,
    startTime,
    endTime
  };

  db.reservations.push(reservation);
  return reservation;
};

/* Poista yksittäinen varaus */
exports.deleteReservation = (id) => {
  const index = db.reservations.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error("Varausta ei löytynyt");
  }

  db.reservations.splice(index, 1);
};

/* Hae huoneen varaukset */
exports.getReservationsByRoom = (room) => {
  return db.reservations.filter(r => r.room === room);
};