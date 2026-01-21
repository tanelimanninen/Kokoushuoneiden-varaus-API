const db = require("../data/inMemoryDb");
const { isOverlapping } = require("../utils/timeUtils");

/* FUNKTIO 1: Luo uusi varaus */
exports.createReservation = ({ room, startTime, endTime }) => {
  // Validointi 1: tiedot puuttuvat
  if (!room || !startTime || !endTime) {
    // Palautetaan virheviesti
    throw new Error("Puuttuvat tiedot");
  }

  // Muutetaan JavaScript-olioiksi
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // Validointi 2: Aloitusaika on menneisyydessä
  if (start < now) {
    // Palautetaan virheviesti
    throw new Error("Varauksen aloitusaika ei voi olla menneessä");
  }

  // Validointi 3: Aloitusaika on ennen lopetusta
  if (start >= end) {
    // Palautetaan virheviesti
    throw new Error("Varauksen aloitusaika tulee olla ennen lopetusaikaa");
  }

  // Käydään tietokanta läpi, palauttaa true jos saman huone-arvon objektilla päällekkäinen varaus
  const overlapping = db.reservations.some(r =>
    r.room === room &&
    isOverlapping(startTime, endTime, r.startTime, r.endTime)
  );

  // Validointi 4: Varaus on päällekkäinen jo olemassa olevan varauksen kanssa
  if (overlapping) {
    // Palautetaan virheviesti
    throw new Error("Aikaväli on jo varattu");
  }

  // Luodaan varausobjekti
  const reservation = {
    id: db.nextId++,
    room,
    startTime,
    endTime
  };

  // Viedään objekti tietokantaan
  db.reservations.push(reservation);

  // Palautetaan luotu varausobjekti
  return reservation;
};

/* FUNKTIO 2: Poista yksittäinen varaus */
exports.deleteReservation = (id) => {
  // Haetaan tietokannasta parametria vastaava varausobjektin id-kenttä
  const index = db.reservations.findIndex(r => r.id === id);

  // Jos varausta ei löydy
  if (index === -1) {
    // Palautetaan virheviesti
    throw new Error("Varausta ei löytynyt");
  }

  // Poistetaan varaus tietokannasta annetun indeksin perusteella
  db.reservations.splice(index, 1);
};

/* FUNKTIO 3: Hae annetun huoneen varaukset */
exports.getReservationsByRoom = (room) => {
  // Haetaan tietokannasta huonekohtaiset varaukset
  const roomReservations = db.reservations.filter(r => r.room === room);

  // Palautetaan annetun huoneen varaukset
  return roomReservations;
};