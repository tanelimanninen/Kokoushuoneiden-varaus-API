import { showAlert } from "./showAlert.js";
import { showConfirm } from "./showConfirm.js";

import { createReservation } from "./createReservation.js";
import { loadReservations } from "./loadReservations.js";

// Haetaan DOM:ista painikkeet ja lisätään tapahtuman käsittelijät
document.getElementById("createBtn").addEventListener("click", createReservation);
document.getElementById("searchBtn").addEventListener("click", loadReservations);

// Varausten poistaminen käyttöliittymässä (DELETE)
async function deleteReservation(id) {
  // Varmistetaan poistaminen ensin käyttäjältä
  const confirmed = await showConfirm("Haluatko varmasti poistaa varauksen?");
  
  // Jos ei varmistusta, lopetetaan tähän
  if (!confirmed) return;

  // Haetaan palvelimelta id-arvoa vastaava varaus ja lähetetään DELETE-pyyntö
  const response = await fetch(`/api/reservations/${id}`, {
    method: "DELETE"
  });

  // Jos status koodi on 204 (no content)
  if (response.status === 204) {
    // Tulostetaan käyttöliittymään notifikaatio (success)
    showAlert("Varaus poistettu", "success");
    // Päivitetään listakomponentti
    loadReservations();
  }
  // Jos status koodi on muuta kuin 204 
  else {
    // Luodaan palvelimen datasta JavaScript-olio
    const err = await response.json();
    // Tulostetaan data konsolissa
    console.log(err);
    // Tulostetaan käyttöliittymään notifikaatio (error)
    showAlert("Varauksen poisto epäonnistui", "error");
  }
}
