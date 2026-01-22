const db = require("../data/inMemoryDb");
const validateRoom = require("../utils/validateRoom");
const { isOverlapping } = require("../utils/timeUtils");
const { reservations } = db;

// Luo uusi varaus
function createReservation({ room, startTime, endTime }) {
  // VALIDOINTI 1: Kaikki tiedot löytyvät
  if (!room || !startTime || !endTime) {
    // Palautetaan virheviesti
    throw new Error("Puuttuvat tiedot");
  }

  // VALIDOINTI 2: Annettu huone löytyy tietokannasta
  validateRoom(room);

  // Muutetaan JavaScript-olioiksi
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // VALIDOINTI 3: Aloitusaika ei ole menneisyydessä
  if (start < now) {
    // Palautetaan virheviesti
    throw new Error("Varauksen aloitusaika ei voi olla menneessä");
  }

  // VALIDOINTI 4: Aloitusaika ei ole ennen lopetusta
  if (start >= end) {
    // Palautetaan virheviesti
    throw new Error("Varauksen aloitusaika tulee olla ennen lopetusaikaa");
  }

  // VALIDOINTI 5: Varaus sijoittu klo 08:00 - 18:00 välille
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
  const overlapping = reservations.some(r =>
    r.room === room &&
    isOverlapping(startTime, endTime, r.startTime, r.endTime)
  );

  // VALIDOINTI 6: Varaus on päällekkäinen jo olemassa olevan varauksen kanssa
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
  reservations.push(reservation);

  // Palautetaan luotu varausobjekti
  return reservation;
};

module.exports = createReservation;