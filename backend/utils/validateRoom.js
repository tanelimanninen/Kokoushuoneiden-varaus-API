const db = require("../data/inMemoryDb");

// APUFUNKTIO: Validoi huonearvo
function validateRoom(room) {
  const exists = db.rooms.some(r => r.name === room);
  if (!exists) {
    throw new Error("Virheellinen huone");
  }
}

module.exports = validateRoom ;