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
  if (!confirm("Haluatko varmasti poistaa varauksen?")) return;

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
