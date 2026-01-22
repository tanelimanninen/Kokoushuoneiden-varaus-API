import { createReservation } from "./createReservation.js";
import { loadReservations } from "./loadReservations.js";

// Haetaan DOM:ista painikkeet ja lisätään tapahtuman käsittelijät
document.getElementById("createBtn").addEventListener("click", createReservation);
document.getElementById("searchBtn").addEventListener("click", loadReservations);
