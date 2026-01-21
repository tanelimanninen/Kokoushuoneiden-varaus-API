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
    content.className = "confirm-content";

    // Confirm ilmoituksen ikoni (käytetään alert-ikonin tyylittelyä)
    const icon = document.createElement("img");
    icon.className = "alert-icon";
    icon.src = "../assets/circle-question-solid-full.svg";
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

export { showAlert, showConfirm };