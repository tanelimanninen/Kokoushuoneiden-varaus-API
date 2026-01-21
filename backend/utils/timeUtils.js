// Tarkistetaan aikavälien päällekkäisyys
exports.isOverlapping = (startA, endA, startB, endB) => {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
};
