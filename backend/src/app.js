const express = require("express");
const path = require("path");
const reservationRoutes = require("../routes/reservations");

// Luodaan express-sovellus
const app = express();

// Mahdollistetaan JSON-datan lukeminen pyyntöjen rungosta
app.use(express.json());

// Näytetään frontendin tiedostot selaimessa
app.use(express.static(path.join(__dirname, "../../frontend")));

// Ohjataan polun pyynnöt routerille
app.use("/api/reservations", reservationRoutes);

module.exports = app;
