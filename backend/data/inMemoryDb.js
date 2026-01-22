// Alustetaan dataan huonearvot
const rooms = [
  { id: 1, name: "Kokoustila A" },
  { id: 2, name: "Kokoustila B" },
  { id: 3, name: "Kokoustila C" }
];

// Alustetaan dataan array varauksille
const reservations = [];

// Alusta dataan id
let nextId = 1;

module.exports = {
  nextId,
  rooms,
  reservations
};
