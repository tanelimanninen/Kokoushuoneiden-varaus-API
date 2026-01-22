import { showAlert } from "./showAlert.js";
import { loadReservations } from "./loadReservations.js";

// Varauksen luomisen käsittely käyttöliittymässä (POST)
async function createReservation() {
  // Haetaan DOM:ista lomakkeen syöttöarvot
  const room = document.getElementById("room").value;
  const startTime = document.getElementById("start").value;
  const endTime = document.getElementById("end").value;

  // Jos syöttöarvo on tyhjä
  if (!room || !startTime || !endTime) {
    showAlert("Täytä lomakkeen kaikki kentät", "error");
    return;
  }

  try {
    // Lähetetään POST-pyyntö palvelimelle
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room, startTime, endTime })
    });

    // Jos pyyntö epäonnistuu, lopetetaan tähän
    if (!response.ok) {
      // Haetaan vastauksen body-data JSON-muodossa
      const reservation = await response.json();
      // Tulostetaan datan error-viesti
      showAlert(reservation.error, "error");

      return;
    }

    // Haetaan vastauksen body-data
    const reservation = await response.json();
    // Tulostetaan notifikaatio (success)
    showAlert(`Varaus luotu (${reservation.room})`, "success");
    // Päivitetään käyttöliittymän listakomponentti
    loadReservations();

  } catch (err) {
    // Tulostetaan notifikaatio (error)
    showAlert("Palvelinvirhe", "error");
  }
}

export { createReservation };