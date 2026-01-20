document.getElementById("createBtn").addEventListener("click", createReservation);
document.getElementById("searchBtn").addEventListener("click", loadReservations);

async function createReservation() {
  const room = document.getElementById("room").value;
  const startTime = document.getElementById("start").value;
  const endTime = document.getElementById("end").value;

  if (!room || !startTime || !endTime) {
    alert("Täytä kaikki kentät");
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
      alert(errMsg);
      return;
    }

    const reservation = await response.json();
    alert("Varaus luotu");
    loadReservations();

  } catch (err) {
    alert("Palvelinvirhe: " + err.message);
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
    alert("Varaus poistettu");
    loadReservations(); // Päivitetään lista automaattisesti
  } else {
    const err = await response.json();
    alert(err.error || "Varauksen poisto epäonnistui");
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("fi-FI");
}
