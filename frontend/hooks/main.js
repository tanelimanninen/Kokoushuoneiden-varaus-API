import { showAlert, showConfirm } from "./notification.js";
import { formatDate } from "./formatDate.js";

// Haetaan DOM:ista painikkeet ja lisätään tapahtuman käsittelijät
document.getElementById("createBtn").addEventListener("click", createReservation);
document.getElementById("searchBtn").addEventListener("click", loadReservations);

// Varauksen luomisen käsittely käyttöliittymässä (POST)
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

// Varausten tulostaminen käyttöliittymässä (GET)
async function loadReservations() {
  // Haetaan DOM:ista huoneen valintakentän arvo
  const room = document.getElementById("searchRoom").value;
  // Haetaan DOM:ista lista-komponentti
  const list = document.getElementById("reservations");
  list.innerHTML = "";

  // Haetaan palvelimelta huonekohtainen data
  const response = await fetch(`/api/reservations/${room}`);
  // Luodaan datasta JavaScript-olio
  const reservations = await response.json();

  // Jos varauksia ei löydy
  if (reservations.length === 0) {
    // Tulostetaan listakomponenttiin li-elementti
    list.innerHTML = "<li>Ei varauksia</li>";
    return;
  }

  // Käydään reservations-array läpi ja lisätään jokaiseen seuraavat
  reservations.forEach(r => {
    // Luodaan li-elementti
    const li = document.createElement("li");
    // Sisällytetään apufunktioiden avulla li-komponenttiin varauksen aikatiedot
    li.textContent = `${formatDate(r.startTime)} – ${formatDate(r.endTime)}`;

    // Luodaan poistopainike
    const deleteBtn = document.createElement("button");
    // Luodaan painikkeelle ikoni
    const icon = document.createElement("img");
    // Haetaan ikoni projektin hakemistosta
    icon.src = "./assets/circle-xmark-solid-full.svg"
    // Lisätään ikonille alt-teksti
    icon.alt = "Poista varaus";
    // Lisätään ikonikomponentille class-arvo
    icon.className = "delete-icon";

    // Asetellaan komponentit parentteihinsa
    deleteBtn.appendChild(icon);
    li.appendChild(deleteBtn);
    list.appendChild(li);

    // Määritellään poistopainikkeen tapahtuman käsittelijä
    deleteBtn.onclick = () => deleteReservation(r.id);
  });
}

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
