import { formatDate } from "./formatDate.js";
import { deleteReservation } from "./deleteReservation.js";

// Varausten tulostaminen käyttöliittymässä (GET)
async function loadReservations() {
  // Haetaan DOM:ista huoneen valintakentän arvo
  const room = document.getElementById("searchRoom").value;
  // Haetaan DOM:ista lista-komponentti
  const list = document.getElementById("reservations");
  list.innerHTML = "";
  // Haetaan listan otsikkoelementti
  const header = document.getElementById("activeRoomName");
  // Päivitetään lista-elementin yllä oleva otsikko aktiivisella kokoustilan nimellä (joka haun yhteydessä)
  header.textContent = room;

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

export { loadReservations };