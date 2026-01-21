document.getElementById("createBtn").addEventListener("click", createReservation);
document.getElementById("searchBtn").addEventListener("click", loadReservations);

async function createReservation() {
  const room = document.getElementById("room").value;
  const startTime = document.getElementById("start").value;
  const endTime = document.getElementById("end").value;

  if (!room || !startTime || !endTime) {
    showAlert("Täytä kaikki kentät", "error");
    return;
  }

  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room, startTime, endTime })
    });

    if (!response.ok) {
      // Varmistetaan, että vastaus sisältää JSONia
      let errMsg = "Varaus epäonnistui";
      try {
        const err = await response.json();
        if (err.error) errMsg = err.error;
      } catch {
        // Ei JSONia → käytetään oletusvirhettä
      }
      showAlert(errMsg, "error");
      return;
    }

    const reservation = await response.json();
    showAlert("Varaus luotu", "success");
    loadReservations();

  } catch (err) {
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

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("fi-FI");
}

// ehdollistettu ja automatisoitu funktio popup-ilmoituksille
function showAlert(message, type = "success", duration = 3000) {
  const container = document.getElementById("alert-container");

  const alert = document.createElement("div");
  alert.className = `custom-alert ${type}`;

  // Alertin ikoni
  const icon = document.createElement("img");
  icon.className = "alert-icon";
  icon.src = type === "error" ? "./assets/circle-exclamation-solid-full.svg" : "./assets/circle-check-solid-full.svg";
  icon.alt = type;

  // Alertin teksti
  const text = document.createElement("span");
  text.textContent = message;

  alert.appendChild(icon);
  alert.appendChild(text);
  container.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, duration);
}

function showConfirm(message) {
  return new Promise((resolve) => {
    // Haetaan DOM:sta oikea div-komponentti (käytetään samaa alert-komponenttia pohjana)
    const container = document.getElementById("alert-container");
    container.innerHTML = "";

    // Luodaan koko sisällölle oma komponentti ja class
    const confirm = document.createElement("div");
    confirm.className = "custom-confirm";

    // Luodaan ikonille ja tekstille oma div (layoutissa ylin rivi)
    const content = document.createElement("div");
    content.className = "confirm-content"
    // Confirm ilmoituksen ikoni (käytetään alert-ikonin tyylittelyä)
    const icon = document.createElement("img");
    icon.className = "alert-icon";
    icon.src = "./assets/circle-question-solid-full.svg";
    icon.alt = "Vahvistus";
    // Confirm ilmoituksen teksti
    const text = document.createElement("span");
    text.textContent = message;

    // Confirm viestin painikkeille oma div (layoutissa alin rivi)
    const buttons = document.createElement("div");
    buttons.className = "confirm-buttons";
    // Painike poiston vahvistukselle
    const okBtn = document.createElement("button");
    okBtn.textContent = "Vahvista";
    okBtn.id = "confirm-ok";
    // Painike poiston peruuttamiselle
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Peruuta";
    cancelBtn.id = "confirm-cancel";
    // Tapahtuman käsittely vahvistuspainikkeelle
    okBtn.onclick = () => {
      container.innerHTML = "";
      resolve(true);
    };
    // Tapahtuman käsittely peruutuspainikkeelle
    cancelBtn.onclick = () => {
      container.innerHTML = "";
      resolve(false);
    };

    // Asetellaan komponentit parentteihinsa
    content.appendChild(icon);
    content.appendChild(text);
    buttons.appendChild(okBtn);
    buttons.appendChild(cancelBtn);
    confirm.appendChild(content);
    confirm.appendChild(buttons);
    container.appendChild(confirm);
  })
}
