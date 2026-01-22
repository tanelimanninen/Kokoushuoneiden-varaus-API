// ehdollistettu ja automatisoitu funktio popup-ilmoituksille
function showAlert(message, type = "success", duration = 3000) {
  // Haetaan DOM:sta oikea div-komponentti
  const container = document.getElementById("alert-container");

  // Luodaan komponentti notifikaation sisällölle
  const alert = document.createElement("div");
  alert.className = `custom-alert ${type}`;

  // Notifikaation ikonikomponentti (ehdollistettu)
  const icon = document.createElement("img");
  icon.className = "alert-icon";
  icon.src = type === "error" ? "../assets/circle-exclamation-solid-full.svg" : "../assets/circle-check-solid-full.svg";
  icon.alt = type;

  // Notifikaation tekstikomponentti
  const text = document.createElement("span");
  text.textContent = message;
  
  // Asetellaan komponentit parentteihinsa
  alert.appendChild(icon);
  alert.appendChild(text);
  container.appendChild(alert);

  // Ajastetaan notifikaation näkyvyyden kesto (3s)
  setTimeout(() => {
      alert.style.opacity = "0";
      setTimeout(() => alert.remove(), 300);
  }, duration);
}



export { showAlert };