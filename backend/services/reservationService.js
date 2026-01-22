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

  // Validointi 4: Varaus ei sijoitu klo 08:00 - 18:00 välille
  // Luodaan toimistoaikojen raja-arvot muuttujiin
  const OFFICE_START = 8;
  const OFFICE_END = 18;

  // Haetaan parametreista tuntiarvot
  const startHour = start.getHours();
  const endHour = end.getHours();
  // Haetaan parametreista minuuttiarvot
  const startMinutes = start.getMinutes();
  const endMinutes = end.getMinutes();

  // Aloitustunti on isompi kuin raja-arvo tai se on 8 ja minuuttiarvo on 0 tai isompi
  const startOk = startHour > OFFICE_START || (startHour === OFFICE_START && startMinutes >= 0);
  // Lopetustunti on pienempi kuin raja-arvo tai se on 18 ja minuuttiarvo on 0
  const endOk = endHour < OFFICE_END || (endHour === OFFICE_END && endMinutes === 0);

  if (!startOk || !endOk) {
    // Palautetaan virheviesti
    throw new Error("Varaus sallitaan vain toimistoaikana (08:00 - 18:00)");
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