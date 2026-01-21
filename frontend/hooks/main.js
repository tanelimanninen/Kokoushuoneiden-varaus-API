import { showAlert, showConfirm } from "./notification.js";
import { formatDate } from "./formatDate.js";

// Haetaan DOM:ista painikkeet ja lisätään tapahtuman käsittelijät
document.getElementById("createBtn").addEventListener("click", createReservation);
document.getElementById("searchBtn").addEventListener("click", loadReservations);

// Varauksen luomisen käsittely käyttöliittymässä
async function createReservation() {
  // Haetaan DOM:ista lomakkeen syöttöarvot
  const room = document.getElementById("room").value;
  const startTime = document.getElementById("start").value;
  const endTime = document.getElementById("end").value;

  // Jos syöttöarvo on tyhjä
  if (!room || !startTime || !endTime) {
    showAlert("Täytä kaikki kentät", "error");
    return;
  }

  try {
    // Lähetetään POST-pyyntö palvelimelle
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room, startTime, endTime })
    });

    // Jos pyyntö epäonnistuu
    if (!response.ok) {
      // Varmistetaan, että vastaus sisältää JSONia
      try {
        const err = await response.json();
        if (err.error) errMsg = err.error;
      } catch {
        // Ei JSONia → käytetään oletusvirhettä
      }
      // Tulostetaan notifikaatio (error)
      showAlert("Varaus epäonnistui", "error");
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
    showAlert("Palvelinvirhe: ", err.message);
  }
}

async function loadReservations() {
  const room = document.getElementById("searchRoom").value;
  const list = document.getElementById("reservations");
  list.innerHTML = "";

  const response = await fetch(`/api/reservations/${room}`);
  const reservations = await response.json();

  // jos varauksia ei löydy
  if (reservations.length === 0) {
    list.innerHTML = "<li>Ei varauksia</li>";
    return;
  }

  reservations.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${formatDate(r.startTime)} – ${formatDate(r.endTime)}`;

    // Luodaan poistonappi
    const deleteBtn = document.createElement("button");
    // Luodaan ikoni
    const icon = document.createElement("img");
    icon.src = "./assets/circle-xmark-solid-full.svg"
    icon.alt = "Poista varaus";
    icon.className = "delete-icon";

    deleteBtn.appendChild(icon);
    deleteBtn.onclick = () => deleteReservation(r.id);

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

async function deleteReservation(id) {
 // Varmistetaan ensin käyttäjältä poistaminen
 const confirmed = await showConfirm("Haluatko varmasti poistaa varauksen?");
 if (!confirmed) return;

  const response = await fetch(`/api/reservations/${id}`, {
    method: "DELETE"
  });

  if (response.status === 204) {
    showAlert("Varaus poistettu", "success");
    loadReservations(); // Päivitetään lista automaattisesti
  } else {
    const err = await response.json();
    console.log(err);
    showAlert("Varauksen poisto epäonnistui", "error");
  }
}
