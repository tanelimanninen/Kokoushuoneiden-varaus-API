const express = require("express");
const path = require("path");
const reservationRoutes = require("../routes/reservations");

const app = express();

app.use(express.json());

// Frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// API
app.use("/api/reservations", reservationRoutes);

module.exports = app;

