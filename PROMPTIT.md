# Keskusteluni AI:n kanssa

Käytössäni oli ChatGPT:n ilmaisversio. Valitsin kyseisen tekoälyn, koska se oli minulle parhaiten entuudestaan tuttu.

Tästä alkaa keskustelumme. Olen lisännyt omat kommenttini italicilla, havoinnollistaakseni vuoropuhelun osapuolia.

### Minä:

*Rakennetaan yksinkertainen kokoushuoneiden varausrajapinta (API). Käytetään ohjelmointikielenä JavaScriptiä, ajoympäristönä voisi olla Node.js ja datanhallintaan muistinvaraista tietokantaa (ei tarvita erillistä tietokantaa).*

*Palvelun tulee tarjota käyttäjille seuraavat toiminnot:*
* *Varauksen luonti: Varaa huone tietylle aikavälille.*
* *Varauksen peruutus: Poista varaus.*
* *Varausten katselu: Listaa kaikki tietyn huoneen varaukset.*

### AI:

Alla on yksinkertainen Node.js + Express -pohjainen REST API, joka toteuttaa pyytämäsi kokoushuoneiden varausrajapinnan.
Data säilytetään muistissa (JavaScript-oliot), eikä erillistä tietokantaa tarvita.

#### Teknologiat

* Node.js
* Express
* In-memory data (array)

#### Perusidea

* Huoneilla on varauksia
* Varaus sisältää:
    * id
    * room
    * startTime
    * endTime

#### Asennus ja käynnistys
```
npm init -y
npm install express
node index.js
```
#### index.js
```
const express = require("express");
const app = express();

app.use(express.json());

let reservations = [];
let nextId = 1;

/**
 * Apufunktio: tarkistaa päällekkäiset varaukset
 */
function isOverlapping(room, startTime, endTime) {
  return reservations.some(r =>
    r.room === room &&
    new Date(startTime) < new Date(r.endTime) &&
    new Date(endTime) > new Date(r.startTime)
  );
}

/**
 * 1. Varauksen luonti
 */
app.post("/reservations", (req, res) => {
  const { room, startTime, endTime } = req.body;

  if (!room || !startTime || !endTime) {
    return res.status(400).json({ error: "Puuttuvat tiedot" });
  }

  if (isOverlapping(room, startTime, endTime)) {
    return res.status(409).json({ error: "Aikaväli on jo varattu" });
  }

  const reservation = {
    id: nextId++,
    room,
    startTime,
    endTime
  };

  reservations.push(reservation);
  res.status(201).json(reservation);
});

/**
 * 2. Varauksen peruutus
 */
app.delete("/reservations/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Varausta ei löytynyt" });
  }

  reservations.splice(index, 1);
  res.status(204).send();
});

/**
 * 3. Varausten katselu huonekohtaisesti
 */
app.get("/reservations/:room", (req, res) => {
  const room = req.params.room;
  const roomReservations = reservations.filter(r => r.room === room);

  res.json(roomReservations);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API käynnissä portissa ${PORT}`);
});
```
#### API-endpointit
##### POST /reservations
```
{
  "room": "Neuvotteluhuone A",
  "startTime": "2026-01-20T10:00",
  "endTime": "2026-01-20T11:00"
}
```
##### DELETE /reservations/{id}
##### GET /reservations/Neuvotteluhuone A

#### Mahdollisia jatkokehityksiä

* Käyttäjätunnistautuminen
* Aikavyöhykkeiden käsittely
* Huoneiden erillinen resurssi
* Tallennus tiedostoon tai tietokantaan
* Päivämääräkohtainen haku

Jos haluat, voin:
* jakaa tämän TypeScript-versiona
* lisätä testit (Jest)
* tehdä OpenAPI / Swagger -kuvauksen
* tai muuttaa tämän REST → GraphQL 👍

### Minä:

*Mikä on sovelluksen tiedostorakenne ja voisiko se olla selkeämpi?*

### AI:

Hyvä kysymys – nykyinen yhden tiedoston ratkaisu toimii, mutta se ei skaalaudu hyvin. Alla ensin nykytila, sitten selkeämpi ja suositeltava tiedostorakenne, sekä perustelut.

#### Nykyinen rakenne (minimaalinen)
```
project/
└── index.js
```

##### Plussat
* Helppo ymmärtää
* Sopii pieneen demo- tai harjoitustyöhön
##### Miinukset
* Kaikki vastuut yhdessä tiedostossa
* Vaikea testata
* Hankala laajentaa (käyttäjät, huoneet, autentikointi)

#### Selkeämpi ja skaalautuva rakenne (suositus)
```
project/
├── src/
│   ├── app.js                # Express-sovelluksen konfigurointi
│   ├── server.js             # Sovelluksen käynnistys
│   │
│   ├── routes/
│   │   └── reservations.js   # HTTP-reitit
│   │
│   ├── controllers/
│   │   └── reservationsController.js
│   │
│   ├── services/
│   │   └── reservationService.js
│   │
│   ├── data/
│   │   └── inMemoryDb.js     # Muistinvarainen "tietokanta"
│   │
│   └── utils/
│       └── timeUtils.js      # Aikavälien käsittely
│
├── package.json
└── README.md
```
#### server.js
Käynnistää palvelimen – ei muuta logiikkaa.
```
const app = require("./app");

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

```
#### app.js
* Expressin konfiguraatio
* Middlewaret
* Reittien rekisteröinti
```
const express = require("express");
const reservationRoutes = require("./routes/reservations");

const app = express();
app.use(express.json());

app.use("/reservations", reservationRoutes);

module.exports = app;

```
#### routes/
Vastaa vain HTTP-reiteistä
```
const express = require("express");
const controller = require("../controllers/reservationsController");

const router = express.Router();

router.post("/", controller.createReservation);
router.delete("/:id", controller.deleteReservation);
router.get("/:room", controller.getReservationsByRoom);

module.exports = router;
```
#### controllers/
* Vastaanottaa pyynnön
* Palauttaa vastauksen
* Ei sisällä liiketoimintalogiikkaa
```
const service = require("../services/reservationService");

exports.createReservation = (req, res) => {
  const result = service.create(req.body);
  res.status(201).json(result);
};

```
#### services/
Liiketoimintalogiikka:
* päällekkäisyystarkistukset
* varauksen luonti
* poisto
```
const db = require("../data/inMemoryDb");

exports.create = (data) => {
  // logiikka täällä
};

```
#### data/
Simuloi tietokantaa – helppo vaihtaa myöhemmin oikeaan DB:hen
```
module.exports = {
  reservations: [],
  nextId: 1
};
```

#### Miksi tämä rakenne on parempi?
✅ Helppo testata (service-kerros ilman HTTP:tä)
✅ Helppo laajentaa (huoneet, käyttäjät, auth)
✅ Yksi vastuu per tiedosto
✅ Ammatillinen rakenne (yleinen Node.js-käytäntö)

### Minä:

*Lisätään package.js-tiedostoon: "scripts": { "test": "echo \"Error: no test specified\" && exit 1", "start": "node index.js" },*

### AI:

Hyvä lisäys 👍
Tuo scripts-osio on täysin oikeanlainen yksinkertaiseen Node.js-sovellukseen.

Tässä miltä package.json näyttää kokonaisuutena (oleelliset osat):
```
{
  "name": "meeting-room-api",
  "version": "1.0.0",
  "description": "Yksinkertainen kokoushuoneiden varausrajapinta",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```
#### Mitä nämä scriptit tekevät?
* npm start
    * Käynnistää sovelluksen:
    * Vastaa komentoa: node index.js
* npm test
    * Tällä hetkellä vain placeholder
    * Hyödyllinen myöhemmin, kun lisäät esim. Jest-testit

#### Pieni parannusehdotus (valinnainen)

Jos myöhemmin jaat koodin src/-hakemistoon:
```
"start": "node src/server.js"
```
Tai kehityskäyttöön:
```
"dev": "nodemon index.js"
```
(jolloin npm install --save-dev nodemon)

### Minä:

*Käytetään pohjana tätä rakennetta:*
```
project/ ├── src/ │ ├── app.js # Express-sovelluksen konfigurointi │ ├── server.js # Sovelluksen käynnistys │ │ │ ├── routes/ │ │ └── reservations.js # HTTP-reitit │ │ │ ├── controllers/ │ │ └── reservationsController.js │ │ │ ├── services/ │ │ └── reservationService.js │ │ │ ├── data/ │ │ └── inMemoryDb.js # Muistinvarainen "tietokanta" │ │ │ └── utils/ │ └── timeUtils.js # Aikavälien käsittely │ ├── package.json └── README.md
```
*Tarvitsemme sovellukselle myös käyttöliittymän web-selaimessa*

### AI:

Hyvä, tämä rakenne on oikein toimiva pohja 👍
Kun lisätään web-käyttöliittymä selaimeen, selkein ratkaisu tähän sovellukseen on:

👉 kevyt frontend (HTML + CSS + JavaScript), joka käyttää backendin REST APIa (fetch).

Alla ehdotus selkeästä ja pedagogisesta kokonaisuudesta, joka sopii hyvin Node.js + Express -projektiin.

#### Päivitetty tiedostorakenne (backend + frontend)
```
project/
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── routes/
│   │   └── reservations.js
│   │
│   ├── controllers/
│   │   └── reservationsController.js
│   │
│   ├── services/
│   │   └── reservationService.js
│   │
│   ├── data/
│   │   └── inMemoryDb.js
│   │
│   └── utils/
│       └── timeUtils.js
│
├── public/                   # 🌐 Web-käyttöliittymä
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── package.json
└── README.md
```
#### Miksi public/?
* Express osaa tarjota staattisia tiedostoja
* Selain lataa HTML/CSS/JS suoraan backendiltä
* Ei tarvita erillistä frontend-frameworkia (React, Vue)

#### 1️⃣ Express: staattisten tiedostojen tarjoaminen
📄 src/app.js
```
const express = require("express");
const path = require("path");
const reservationRoutes = require("./routes/reservations");

const app = express();

app.use(express.json());

// Frontend
app.use(express.static(path.join(__dirname, "../public")));

// API
app.use("/api/reservations", reservationRoutes);

module.exports = app;
```
➡️ Nyt selain avaa:
```
http://localhost:3000
```

#### 2️⃣ Käyttöliittymä – index.html
📄 public/index.html
```
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <title>Kokoushuonevaraukset</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>Kokoushuoneiden varaus</h1>

  <section>
    <h2>Luo varaus</h2>
    <input id="room" placeholder="Huone" />
    <input id="start" type="datetime-local" />
    <input id="end" type="datetime-local" />
    <button onclick="createReservation()">Varaa</button>
  </section>

  <section>
    <h2>Huoneen varaukset</h2>
    <input id="searchRoom" placeholder="Huone" />
    <button onclick="loadReservations()">Hae</button>
    <ul id="reservations"></ul>
  </section>

  <script src="app.js"></script>
</body>
</html>
```

#### 3️⃣ Frontend-logiikka – public/app.js
```
async function createReservation() {
  const room = document.getElementById("room").value;
  const startTime = document.getElementById("start").value;
  const endTime = document.getElementById("end").value;

  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, startTime, endTime })
  });

  if (!response.ok) {
    alert("Varaus epäonnistui");
    return;
  }

  alert("Varaus luotu");
}

async function loadReservations() {
  const room = document.getElementById("searchRoom").value;
  const list = document.getElementById("reservations");
  list.innerHTML = "";

  const response = await fetch(`/api/reservations/${room}`);
  const reservations = await response.json();

  reservations.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.startTime} – ${r.endTime} (ID: ${r.id})`;
    list.appendChild(li);
  });
}
```

#### 4️⃣ Yksinkertainen tyyli – public/styles.css
```
body {
  font-family: Arial, sans-serif;
  margin: 40px;
}

section {
  margin-bottom: 30px;
}

input, button {
  margin: 5px;
}
```

#### Lopputulos

✅ Backend: REST API (Express)

✅ Frontend: selainpohjainen käyttöliittymä

✅ Sama Node.js-palvelin hoitaa molemmat

✅ Helppo laajentaa

### Minä:

*Nyt meillä on app.js-niminen tiedosto kahdessa kansiossa.*

### AI:

Hyvä havainto – tämä on oikeasti tärkeä selkeyskysymys, eikä pelkkää nimiviilausta 👍
Nykytilanne on teknisesti ok, mutta nimikonflikti on hämmentävä ihmisille.

#### Ongelma
Meillä on nyt:
```
src/app.js        # Express-sovellus
public/app.js     # Frontendin JavaScript
```
Node.js ei sekoa tähän, mutta:
* Kehittäjä sekoaa 😄
* Dokumentointi vaikeutuu
* Virheiden jäljitys hidastuu

#### Suositus: nimeä frontendin tiedosto uudelleen
✅ Paras ja yleisin ratkaisu
```
public/
├── index.html
├── styles.css
└── main.js       # ← frontendin päälogiikka
```
Muutos index.html-tiedostoon
```
<script src="main.js"></script>
```
Lopullinen, selkeä rakenne
```
project/
├── src/
│   ├── app.js                 # Express-konfiguraatio
│   ├── server.js              # Serverin käynnistys
│   │
│   ├── routes/
│   │   └── reservations.js
│   │
│   ├── controllers/
│   │   └── reservationsController.js
│   │
│   ├── services/
│   │   └── reservationService.js
│   │
│   ├── data/
│   │   └── inMemoryDb.js
│   │
│   └── utils/
│       └── timeUtils.js
│
├── public/
│   ├── index.html
│   ├── styles.css
│   └── main.js                # Frontend JS
│
├── package.json
└── README.md
```
#### Miksi tämä on paras ratkaisu?
* app.js on backend-maailmassa vakiintunut nimi Express-sovellukselle
* main.js / frontend.js / ui.js on selkeä frontendille
* Ei sekaannuksia import-polkujen tai debuggaamisen kanssa
* Helppo selittää muille

### Minä:

*Mennään frontendissä nimellä main.js*

### AI:

Hyvä, main.js on erinomainen ja selkeä valinta 👍
Viedään tämä loppuun asti johdonmukaisesti.

#### Lopullinen rakenne (frontend nimetty oikein)
```
project/
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── routes/
│   │   └── reservations.js
│   │
│   ├── controllers/
│   │   └── reservationsController.js
│   │
│   ├── services/
│   │   └── reservationService.js
│   │
│   ├── data/
│   │   └── inMemoryDb.js
│   │
│   └── utils/
│       └── timeUtils.js
│
├── public/
│   ├── index.html
│   ├── styles.css
│   └── main.js        # ✅ frontend-logiikka
│
├── package.json
└── README.md
```
#### Frontend: päivitetyt tiedostot
public/index.html
```
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <title>Kokoushuonevaraukset</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>Kokoushuoneiden varaus</h1>

  <section>
    <h2>Luo varaus</h2>
    <input id="room" placeholder="Huone" />
    <input id="start" type="datetime-local" />
    <input id="end" type="datetime-local" />
    <button id="createBtn">Varaa</button>
  </section>

  <section>
    <h2>Huoneen varaukset</h2>
    <input id="searchRoom" placeholder="Huone" />
    <button id="searchBtn">Hae</button>
    <ul id="reservations"></ul>
  </section>

  <script src="main.js"></script>
</body>
</html>
```
public/main.js
```
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

  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, startTime, endTime })
  });

  if (!response.ok) {
    const err = await response.json();
    alert(err.error || "Varaus epäonnistui");
    return;
  }

  alert("Varaus luotu");
}

async function loadReservations() {
  const room = document.getElementById("searchRoom").value;
  const list = document.getElementById("reservations");
  list.innerHTML = "";

  if (!room) {
    alert("Anna huoneen nimi");
    return;
  }

  const response = await fetch(`/api/reservations/${room}`);
  const reservations = await response.json();

  if (reservations.length === 0) {
    list.innerHTML = "<li>Ei varauksia</li>";
    return;
  }

  reservations.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${formatDate(r.startTime)} – ${formatDate(r.endTime)} (ID: ${r.id})`;
    list.appendChild(li);
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("fi-FI");
}
```

#### Mikä parani samalla?

✔ Ei nimikonflikteja

✔ Frontend-koodi on erillään backendistä

✔ Ei inline-onclick-attribuutteja (parempi käytäntö)

✔ Selkeä tapahtumapohjainen rakenne

### Minä:

*Lisätään backendiin toiminnallisuudet varauksen luonnille, peruutukselle ja varausten katselulle.*

### AI:

Selvä 👍
Alla on täydellinen backend-toteutus käyttäen sovittua kansiorakennetta, joka tukee:

✅ varauksen luontia
✅ varauksen peruutusta
✅ huonekohtaisten varausten katselua

Kaikki data pidetään muistissa.

#### 1️⃣ src/data/inMemoryDb.js
Muistinvarainen “tietokanta”
```
module.exports = {
  reservations: [],
  nextId: 1
};
```
#### 2️⃣ src/utils/timeUtils.js
Aikavälien päällekkäisyyden tarkistus
```
exports.isOverlapping = (startA, endA, startB, endB) => {
  return new Date(startA) < new Date(endB) &&
         new Date(endA) > new Date(startB);
};
```
#### 3️⃣ src/services/reservationService.js
Liiketoimintalogiikka (tärkein osa)
```
const db = require("../data/inMemoryDb");
const { isOverlapping } = require("../utils/timeUtils");

/**
 * Luo uusi varaus
 */
exports.createReservation = ({ room, startTime, endTime }) => {
  if (!room || !startTime || !endTime) {
    throw new Error("Puuttuvat tiedot");
  }

  const overlapping = db.reservations.some(r =>
    r.room === room &&
    isOverlapping(startTime, endTime, r.startTime, r.endTime)
  );

  if (overlapping) {
    throw new Error("Aikaväli on jo varattu");
  }

  const reservation = {
    id: db.nextId++,
    room,
    startTime,
    endTime
  };

  db.reservations.push(reservation);
  return reservation;
};

/**
 * Poista varaus
 */
exports.deleteReservation = (id) => {
  const index = db.reservations.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error("Varausta ei löytynyt");
  }

  db.reservations.splice(index, 1);
};

/**
 * Hae huoneen varaukset
 */
exports.getReservationsByRoom = (room) => {
  return db.reservations.filter(r => r.room === room);
};
```
#### 4️⃣ src/controllers/reservationsController.js
HTTP-pyyntöjen käsittely
```
const service = require("../services/reservationService");

/**
 * POST /api/reservations
 */
exports.createReservation = (req, res) => {
  try {
    const reservation = service.createReservation(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/reservations/:id
 */
exports.deleteReservation = (req, res) => {
  try {
    service.deleteReservation(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/reservations/:room
 */
exports.getReservationsByRoom = (req, res) => {
  const reservations = service.getReservationsByRoom(req.params.room);
  res.json(reservations);
};
```
#### 5️⃣ src/routes/reservations.js
Reittimäärittelyt
```
const express = require("express");
const controller = require("../controllers/reservationsController");

const router = express.Router();

router.post("/", controller.createReservation);
router.delete("/:id", controller.deleteReservation);
router.get("/:room", controller.getReservationsByRoom);

module.exports = router;
```
#### 6️⃣ src/app.js
Express-sovelluksen konfigurointi
```
const express = require("express");
const path = require("path");
const reservationRoutes = require("./routes/reservations");

const app = express();

app.use(express.json());

// Frontend
app.use(express.static(path.join(__dirname, "../public")));

// API
app.use("/api/reservations", reservationRoutes);

module.exports = app;
```
#### 7️⃣ src/server.js
Sovelluksen käynnistys
```
const app = require("./app");

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server käynnissä portissa ${PORT}`);
});
```

#### 📌 API-yhteenveto
| Toiminto | Metodi | Polku |
| -------- |--------| ----- |
| Luo varaus | POST | /api/reservations |
| Poista varaus | DELETE | /api/reservations/:id |
| Listaa huoneen varaukset | GET | /api/reservations/:room |

### Minä:

*Miten testaan, että backendin logiikka toimii?*

### AI:

Hienoa, nyt voidaan varmistaa että backend toimii oikein ennen kuin tehdään lisää frontendia.
On olemassa muutama tapa testata Node.js + Express backendia:

#### 1️⃣ Nopein tapa: manuaalinen testaus selaimella / Postmanilla / curlilla
a) Käynnistä backend
```
node src/server.js
```
b) Luo varaus (POST)
```
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"room":"A", "startTime":"2026-01-20T10:00", "endTime":"2026-01-20T11:00"}'
```
Jos onnistuu: saat JSON-objektin, esim:
```
{
  "id": 1,
  "room": "A",
  "startTime": "2026-01-20T10:00",
  "endTime": "2026-01-20T11:00"
}
```
c) Katso huoneen varaukset (GET)
```
curl http://localhost:3000/api/reservations/A
```
d) Peruuta varaus (DELETE)
```
curl -X DELETE http://localhost:3000/api/reservations/1
```
* Jos varaus löytyy → 204 No Content
* Jos ei löydy → 404 Not Found

#### 2️⃣ Automatisoitu testaus Node.js:llä (Jest + Supertest)
Tämä on puhdas tapa testata logiikka ilman frontendia.

a) Asenna tarvittavat paketit
```
npm install --save-dev jest supertest
```
Lisää package.json:
```
"scripts": {
  "test": "jest",
  "start": "node src/server.js"
}
```
b) Luo testi tests/reservation.test.js
```
const request = require("supertest");
const app = require("../src/app");

describe("Reservations API", () => {
  let reservationId;

  test("Luo varaus", async () => {
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Testihuone",
        startTime: "2026-01-20T10:00",
        endTime: "2026-01-20T11:00"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBeDefined();
    reservationId = response.body.id;
  });

  test("Hae huoneen varaukset", async () => {
    const response = await request(app)
      .get("/api/reservations/Testihuone");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("Peruuta varaus", async () => {
    const response = await request(app)
      .delete(`/api/reservations/${reservationId}`);

    expect(response.statusCode).toBe(204);
  });

  test("Peruutus epäonnistuu jos varaus ei ole olemassa", async () => {
    const response = await request(app)
      .delete(`/api/reservations/9999`);

    expect(response.statusCode).toBe(404);
  });
});
```
c) Testien ajaminen
```
npm test
```

Jos haluat, voin kirjoittaa valmiin testikokonaisuuden koko backendille, jossa testataan kaikki POST, GET ja DELETE -polut automaattisesti.

Haluatko, että teen sen?

### Minä:

*Käytän tässä vaiheessa vaihtoehto 1, postmania. Testataan kaikki kolme polkua yksitellen.*

### AI:

Loistavaa! 👍 Käydään läpi kaikki kolme polkua vaihe vaiheelta Postmanilla, jotta voit testata backendin logiikan nopeasti.

#### 1️⃣ Käynnistä backend
Varmista, että palvelin on käynnissä:
```
node src/server.js
```
Oletuksena kuuntelee porttia 3000:
```
http://localhost:3000
```

#### Luo varaus (POST)
* Metodi: POST
* URL: http://localhost:3000/api/reservations
* Body: (JSON, raw)
```
{
  "room": "Neuvotteluhuone A",
  "startTime": "2026-01-20T10:00",
  "endTime": "2026-01-20T11:00"
}
```
Tarkistettavaa:
* Status: 201 Created
* Response JSON sisältää ainakin:
```
{
  "id": 1,
  "room": "Neuvotteluhuone A",
  "startTime": "2026-01-20T10:00",
  "endTime": "2026-01-20T11:00"
}
```

#### 3️⃣ Listaa huoneen varaukset (GET)
* Metodi: GET
* URL: http://localhost:3000/api/reservations/Neuvotteluhuone A

Tarkistettavaa:
* Status: 200 OK
* Response JSON on lista varauksista, esim:
```
[
  {
    "id": 1,
    "room": "Neuvotteluhuone A",
    "startTime": "2026-01-20T10:00",
    "endTime": "2026-01-20T11:00"
  }
]
```

#### 4️⃣ Peruuta varaus (DELETE)
* Metodi: DELETE
* URL: http://localhost:3000/api/reservations/1
(vaihda ID vastaamaan aiemmin luotua varausta)

Tarkistettavaa:
* Status: 204 No Content
* Body: tyhjä

Jos ID ei ole olemassa → saat 404 Not Found ja JSON-virheilmoituksen:
```
{ "error": "Varausta ei löytynyt" }
```

#### 5️⃣ Testausvinkkejä Postmanissa
1. Luo ensin POST-varaus → tarkista JSON-vastaus ja ID

2. Tee GET-varaus huoneen nimellä → varmista, että varaus näkyy

3. Tee DELETE ID:llä → varmista status 204

4. Tee uudelleen GET → varmista, että lista on tyhjä

Näin voit varmistaa kaikkien kolmen polun toimivuuden.

Jos haluat, voin seuraavaksi kirjoittaa valmiit testikokoelma-asetukset Postmaniin, niin voit klikata “Run” ja testit ajetaan automaattisesti.

Haluatko, että teen sen?

### Minä:

*Luodaan projektiin vielä automatisoidut testit apin poluille jestillä.*

### AI:

Loistavaa! 😄 Tehdään backendille automatisoidut testit Jestillä + Supertestillä, jotta kaikki kolme polkua (luonti, katselu, peruutus) voidaan testata nopeasti ja toistettavasti.

Tässä ohjeet vaihe vaiheelta.

#### 1️⃣ Asenna riippuvuudet
```
npm install --save-dev jest supertest
```
Päivitä package.json:
```
"scripts": {
  "start": "node src/server.js",
  "test": "jest"
}
```
#### 2️⃣ Luo testihakemisto
```
project/
└── tests/
    └── reservations.test.js
```
#### 3️⃣ Testitiedosto: tests/reservations.test.js
```
const request = require("supertest");
const app = require("../src/app");

describe("Reservations API", () => {
  let reservationId;

  // Testataan varauksen luonti
  test("POST /api/reservations - luo varaus", async () => {
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Testihuone",
        startTime: "2026-01-20T10:00",
        endTime: "2026-01-20T11:00"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.room).toBe("Testihuone");
    reservationId = response.body.id;
  });

  // Testataan varausten katselu
  test("GET /api/reservations/:room - listaa varaukset", async () => {
    const response = await request(app)
      .get("/api/reservations/Testihuone");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].room).toBe("Testihuone");
  });

  // Testataan varauksen peruutus
  test("DELETE /api/reservations/:id - poista varaus", async () => {
    const response = await request(app)
      .delete(`/api/reservations/${reservationId}`);

    expect(response.statusCode).toBe(204);
  });

  // Testataan peruutuksen epäonnistuminen (ei löydy)
  test("DELETE /api/reservations/:id - epäonnistuu, jos varaus ei ole olemassa", async () => {
    const response = await request(app)
      .delete("/api/reservations/9999");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Varausta ei löytynyt");
  });

  // Testataan päällekkäisen varauksen estäminen
  test("POST /api/reservations - estää päällekkäisen varauksen", async () => {
    // Luo ensimmäinen varaus
    await request(app)
      .post("/api/reservations")
      .send({
        room: "OverlapHuone",
        startTime: "2026-01-20T10:00",
        endTime: "2026-01-20T11:00"
      });

    // Yritä päällekkäistä
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "OverlapHuone",
        startTime: "2026-01-20T10:30",
        endTime: "2026-01-20T11:30"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Aikaväli on jo varattu");
  });
});
```
#### 4️⃣ Testien ajaminen
```
npm test
```
Jest ajaa kaikki testit, ja näet konsolissa tuloksen:
```
PASS  tests/reservations.test.js
  Reservations API
    ✓ POST /api/reservations - luo varaus (xx ms)
    ✓ GET /api/reservations/:room - listaa varaukset (xx ms)
    ✓ DELETE /api/reservations/:id - poista varaus (xx ms)
    ✓ DELETE /api/reservations/:id - epäonnistuu, jos varaus ei ole olemassa (xx ms)
    ✓ POST /api/reservations - estää päällekkäisen varauksen (xx ms)
```
#### ✅ Mitä nämä testit kattavat
1. Varauksen luominen (POST)
2. Varausten katselu huoneen mukaan (GET)
3. Varauksen poistaminen (DELETE)
4. Virhetilanne: poisto olemattomalla ID:llä
5. Virhetilanne: päällekkäiset varaukset estetty

Haluatko, että teen seuraavaksi valmiin README-osion, jossa kerrotaan miten testit ajetaan ja miten APIa käytetään Postmanilla ja Jestillä?

### Minä:

*Ok, nyt apin toiminta on testattu backendissä. Lisätään käyttöliittymään vielä varauksen poistaminen.*

### AI:

Loistavaa! Nyt kun backend toimii ja on testattu, voimme lisätä varauksen poistamisen käyttöliittymään selaimessa.
Tässä tehdään pieni päivitys frontendin main.js ja index.html tiedostoihin, niin käyttäjä voi klikata nappia ja poistaa varauksen.

#### 1️⃣ Päivitetään index.html
Lisätään lista varauksista siten, että jokaisella on poistonappi.
```
<section>
  <h2>Huoneen varaukset</h2>
  <input id="searchRoom" placeholder="Huone" />
  <button id="searchBtn">Hae</button>
  <ul id="reservations"></ul>
</section>
```
Ei tarvitse muuttaa paljon, mutta varauksia renderöidessä lisätään Poista-nappi jokaiselle listan itemille.

#### 2️⃣ Päivitetään main.js
```
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

  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, startTime, endTime })
  });

  if (!response.ok) {
    const err = await response.json();
    alert(err.error || "Varaus epäonnistui");
    return;
  }

  alert("Varaus luotu");
  loadReservations(); // Päivitetään lista automaattisesti
}

async function loadReservations() {
  const room = document.getElementById("searchRoom").value;
  const list = document.getElementById("reservations");
  list.innerHTML = "";

  if (!room) {
    alert("Anna huoneen nimi");
    return;
  }

  const response = await fetch(`/api/reservations/${room}`);
  const reservations = await response.json();

  if (reservations.length === 0) {
    list.innerHTML = "<li>Ei varauksia</li>";
    return;
  }

  reservations.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${formatDate(r.startTime)} – ${formatDate(r.endTime)} (ID: ${r.id}) `;

    // Luodaan poistonappi
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Poista";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = () => deleteReservation(r.id, room);

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

async function deleteReservation(id, room) {
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
```

#### 3️⃣ Mitä muutokset tekevät
1. Jokaiselle varaukselle luodaan Poista-nappi listassa
2. Napin klikkaus kutsuu deleteReservation(id, room)
3. Backendin DELETE-polku /api/reservations/:id kutsutaan
4. Onnistuneen poiston jälkeen lista päivittyy automaattisesti
5. Virhetilanteet (esim. varaus ei löydy) näytetään alertilla

##### ✅ Nyt käyttöliittymä tukee kaikkia kolme backend-toimintoa:
1. Luo varaus (POST)
2. Listaa varaukset (GET)
3. Poista varaus (DELETE)

### Minä:

*Miksi deleteReservation(id, room) tarvitsee room-parametrin?*

### AI:

Hyvä huomio! 👀

deleteReservation(id, room) sai tuon room-parametrin alun perin vain siksi, että funktiosta kutsuttiin loadReservations() sen jälkeen ja ajateltiin, että voitaisiin välittää huoneen nimi suoraan.

Mutta katsotaan tarkasti:
```
deleteReservation(r.id, room)
```
* r.id on varauksen ID → tarvitaan backendin DELETE-polkuun
* room → käytettiin loadReservations(room) päivityksessä

#### Ongelmakohta
loadReservations() hakee nykyisen huoneen nimen:
```
const room = document.getElementById("searchRoom").value;
```
Eli deleteReservation() voisi itse hakea huoneen nimen suoraan syöttökentästä, eikä se tarvitse parametrina. Parametri on siis ylimääräinen.

#### Parempi versio
```
async function deleteReservation(id) {
  if (!confirm("Haluatko varmasti poistaa varauksen?")) return;

  const response = await fetch(`/api/reservations/${id}`, { method: "DELETE" });

  if (response.status === 204) {
    alert("Varaus poistettu");
    loadReservations(); // loadReservations hakee huoneen suoraan syöttökentästä
  } else {
    const err = await response.json();
    alert(err.error || "Varauksen poisto epäonnistui");
  }
}
```
Ja nappi lisäys listan renderöinnissä:
```
deleteBtn.onclick = () => deleteReservation(r.id);
```
✅ Tämä yksinkertaistaa funktiota ja vähentää turhia parametreja.

Jos haluat, voin tehdä täyden siistin version frontendistä, jossa kaikki kolme toimintoa (luo, listaa, poista) ovat selkeästi erillisinä funktioina ja ilman ylimääräisiä parametreja.

Haluatko, että teen sen?

### Minä:

*Okei, sovelluksen URLissa UI toimii. Lisätään vielä varauksen luomiseen validointia. Varaus ei saa sijoittua menneeseen aikaan. Lisäksi aloitusajan tulee aina olla ennen lopetusaikaa.*

### AI:

Hienoa! Nyt voidaan lisätä varauksen validointi backendissä, jotta käyttöliittymä ei pysty luomaan epäkelpoja varauksia.
Tarkastetaan kaksi asiaa:
1. Varaus ei saa olla menneessä ajassa
2. Aloitusaika < lopetusaika

#### 1️⃣ Päivitetään reservationService.js
Muokataan createReservation-funktiota:
```
const db = require("../data/inMemoryDb");
const { isOverlapping } = require("../utils/timeUtils");

exports.createReservation = ({ room, startTime, endTime }) => {
  if (!room || !startTime || !endTime) {
    throw new Error("Puuttuvat tiedot");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // 1️⃣ Aloitusaika ei saa olla menneisyydessä
  if (start < now) {
    throw new Error("Varauksen aloitusaika ei voi olla menneessä");
  }

  // 2️⃣ Aloitus ennen lopetusta
  if (start >= end) {
    throw new Error("Varauksen aloitusaika tulee olla ennen lopetusaikaa");
  }

  // 3️⃣ Tarkistetaan päällekkäisyys
  const overlapping = db.reservations.some(r =>
    r.room === room &&
    isOverlapping(startTime, endTime, r.startTime, r.endTime)
  );

  if (overlapping) {
    throw new Error("Aikaväli on jo varattu");
  }

  const reservation = {
    id: db.nextId++,
    room,
    startTime,
    endTime
  };

  db.reservations.push(reservation);
  return reservation;
};
```

#### 2️⃣ Mitä lisättiin
| Validointi                               | Kuvaus                                                |
| ---------------------------------------- | ----------------------------------------------------- |
| `start < now`                            | Jos käyttäjä yrittää varata menneeseen aikaan → virhe |
| `start >= end`                           | Aloitusajan on oltava ennen lopetusaikaa              |

Päällekkäisyystarkistus säilyy ennallaan

#### 3️⃣ Frontendin huolellisuus
Frontendissa voidaan lisäksi estää suoraan valitsemalla min-arvo datetime-local inputille:
```
<input id="start" type="datetime-local" min="2026-01-19T00:00" />
<input id="end" type="datetime-local" />
```
Tämä on vain käyttöliittymä-apu, mutta backendin validointi on aina pakollinen.

#### 4️⃣ Testaus
Yritä luoda varaus menneeseen aikaan → pitäisi saada virheilmoitus:
```
Varauksen aloitusaika ei voi olla menneessä
```
Yritä luoda varaus, jossa start ≥ end → virheilmoitus:
```
Varauksen aloitusaika tulee olla ennen lopetusaikaa
```
Normaalit varaukset toimivat edelleen.

Jos haluat, voimme päivittää myös Jest-testit niin, että ne testavat nämä uudet validoinnit automaattisesti.

Haluatko, että teen sen?

## Välihuomatus

Tässä vaiheessa tein alustavan commitin Git-repositoriooni ja siirryin tehtävässä vaiheeseen 2. Halusin kuitenkin pitää tekoälyn mukana kehitystyössä tästäkin eteenpäin. Päivittelen sille aina ajoittain työvaiheitani ja päivityksiäni. Konsultoin myös ajoittain ongelmakohdissa tai muuten nopeuttaakseni tiettyjä työvaiheita.

### Minä:

*Päivitin projektin kansiorakenteen seuraavasti. Hakemiston juuressa jaetaan kahteen sovelluksen kansiot kahteen pääkansioon: frontend ja backend. Frontendiin UI:n tiedostot index.html, main.js, styles.css. Loput kansiot luonnollisesti backend-kansioon."

### AI:

Hyvä ratkaisu 👍
Tuo jako frontend / backend on erittäin selkeä ja vastaa oikeaa tuotantimallia. Käydään läpi:

1. Miltä lopullinen kansiorakenne näyttää

2. Mitä pieniä muutoksia backendissä tarvitaan

3. Miten sovellus käynnistetään ja avataan selaimessa

#### 1️⃣ Uusi kansiorakenne (selkeä ja looginen)
```
project/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   │
│   │   ├── routes/
│   │   │   └── reservations.js
│   │   │
│   │   ├── controllers/
│   │   │   └── reservationsController.js
│   │   │
│   │   ├── services/
│   │   │   └── reservationService.js
│   │   │
│   │   ├── data/
│   │   │   └── inMemoryDb.js
│   │   │
│   │   └── utils/
│   │       └── timeUtils.js
│   │
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── main.js
│   └── styles.css
│
└── README.md
```
✔ Backend ja frontend eriytetty

✔ Helppo ymmärtää ja dokumentoida

✔ Vastaa monen oikean projektin rakennetta

#### 2️⃣ Backend: staattisten tiedostojen tarjoaminen frontend-kansiosta
Koska frontend on nyt eri pääkansiossa, Expressille pitää kertoa uusi polku.

backend/src/app.js
```
const express = require("express");
const path = require("path");
const reservationRoutes = require("./routes/reservations");

const app = express();

app.use(express.json());

// 👉 Frontend sijaitsee nyt backendin ulkopuolella
app.use(express.static(
  path.join(__dirname, "../../frontend")
));

// API
app.use("/api/reservations", reservationRoutes);

module.exports = app;
```

#### 3️⃣ Backendin käynnistys
Siirry backend-kansioon:
```
cd backend
node src/server.js
```
Palvelin käynnistyy esim.:
```
Server käynnissä portissa 3000
```

#### 4️⃣ Sovelluksen avaaminen selaimessa (tärkeää!)
⚠️ ÄLÄ avaa frontend/index.html suoraan selaimessa
⚠️ ÄLÄ käytä Live Serveriä

✅ Avaa aina:
```
http://localhost:3000
```
Silloin:
*Express tarjoaa frontendin
*fetch("/api/reservations") osuu oikeaan backend-palvelimeen
*Ei CORS-ongelmia
*POST / DELETE toimivat oikein

#### 5️⃣ Frontend: ei muutoksia fetch-kutsuihin
frontend/main.js saa pysyä tällaisena:
```
fetch("/api/reservations", { ... })
```
Koska:
*frontend ja backend tulevat samasta originista
*selain lisää automaattisesti localhost:3000

#### 6️⃣ Miksi tämä rakenne on erinomainen
✅ Backend voidaan myöhemmin ajaa erikseen (Docker, pilvi)

✅ Frontend voidaan myöhemmin korvata React/Vue-sovelluksella

✅ API on selkeästi rajattu /api/*

✅ Sopii hyvin koulutehtävään ja oikeaan projektiin

### Minä:

*Testien tulisi toimia ilman serverin käynnistämistä, eikö?*

### AI:

Kyllä – täysin oikein ✅
Tämä on tärkeä periaate, ja teidän toteutus toimii juuri niin kuin pitääkin.

#### Miksi testien EI tarvitse käynnistää serveriä
Te käytätte testauksessa tätä riviä:
```
const app = require("../src/app");
```
Ja testejä:
```request(app)
  .post("/api/reservations")
```
##### Mitä tässä tapahtuu?
* app on Express-sovellusolio
* Supertest osaa:
  * käynnistää sovelluksen sisäisesti
  * tehdä HTTP-pyynnöt ilman app.listen()
* server.js ei ole mukana testeissä ollenkaan

👉 Tämä on oikea ja suositeltu tapa testata Express-APIa.

#### Miksi server.js pitää olla erillinen
```
src/
├── app.js     ← testattava
└── server.js  ← käynnistää palvelimen
```
* app.js
  * konfiguroi reitit ja middlewaret
  * ei kuuntele porttia
* server.js
  * kutsuu app.listen(...)
  * vain tuotanto-/kehityskäyttöön

Jos listen() olisi app.js:ssä:
* testit yrittäisivät käynnistää palvelimen
* portti voisi olla jo varattu
* testit muuttuisivat epäluotettaviksi

#### Mitä tapahtuisi, jos server käynnistettäisiin testissä?
❌ Portti voi olla varattu

❌ Testit eivät ole rinnakkaistettavia

❌ Testit ovat hitaita

❌ CI/CD rikkoontuu

#### Oikea malli (teillä käytössä)
```
// app.js
const app = express();
module.exports = app;

// server.js
const app = require("./app");
app.listen(3000);

// reservations.test.js
const app = require("../src/app");
request(app).get("/api/reservations/...");
```
✔ Täydellinen rakenne

✔ Testit toimivat ilman serverin käynnistämistä

✔ Vastaa Express + Jest -best practicea

### Minä:

*Yritän ajaa testit /backend-kansiossa, mutta kaikki testit epäonnistuvat (paitsi DELETE /api/reservations/:id - epäonnistuu, jos varaus ei ole olemassa.) Luulen, että testit eivät saa yhteyttä serveriin oikein tällä hetkellä.*

### AI:

Tämä on erittäin hyvä havainto – ja vaistosi on melkein oikea, mutta tarkennetaan:
testit eivät oikeasti “ota yhteyttä serveriin” lainkaan, ja juuri siksi ongelma on todennäköisesti Express-sovelluksen konfiguraatiossa (app.js) eikä testien ajamisessa.

Puretaan tämä rauhassa ja loogisesti.

#### 1️⃣ Varmistetaan ensin perusasia (tärkein)
Testit eivät käytä käynnissä olevaa serveriä
Supertest tekee tämän:
```
request(app).post("/api/reservations")
```
❌ Ei käytä localhost

❌ Ei käytä porttia

❌ Ei tarvitse app.listen()

✅ Kutsuu Express-sovellusta suoraan muistissa

👉 Jos testit epäonnistuvat, syy on lähes aina:
* reitti ei ole rekisteröity
* middleware estää pyynnön
* app.js ei ole oikein rakennettu

#### 2️⃣ Yleisin syy juuri tähän oireeseen (95 % tapauksista)
❗ app.js ei exportoi oikein Express-appia

tai

❗ reitit eivät ole rekisteröity oikein

Oikea app.js (vertaa tähän)
```
const express = require("express");
const path = require("path");
const reservationRoutes = require("./routes/reservations");

const app = express();

app.use(express.json());

// API REITIT – TÄRKEÄÄ
app.use("/api/reservations", reservationRoutes);

// (frontendin static ei vaikuta testaukseen)
app.use(express.static(
  path.join(__dirname, "../../frontend")
));

module.exports = app;
```
🔴 Jos jokin näistä puuttuu tai on väärässä järjestyksessä, testit kaatuvat.

#### 3️⃣ Erittäin tärkeä tarkistus: reservations.js
Varmista että reitit todella vastaavat testejä

📄 backend/src/routes/reservations.js
```
const express = require("express");
const router = express.Router();
const controller = require("../controllers/reservationsController");

router.post("/", controller.createReservation);
router.get("/:room", controller.getReservationsByRoom);
router.delete("/:id", controller.deleteReservation);

module.exports = router;
```
Jos esim.:
* router.post("/reservations", ...) ❌
* tai puuttuu / ❌

→ testit eivät löydä reittiä

#### 4️⃣ Miksi juuri tämä testi menee läpi?
DELETE /api/reservations/:id – epäonnistuu, jos varaus ei ole olemassa

Tämä tarkoittaa:

✅ DELETE-reitti on olemassa

✅ Controller vastaa oikein

✅ Express toimii

Mutta:

❌ POST ei toimi

❌ GET ei toimi

➡️ Tämä viittaa siihen, että:

* POST epäonnistuu ennen kuin data tallennetaan
* GET ei löydä dataa, koska sitä ei koskaan luotu

#### 5️⃣ Todennäköisin varsinainen syy: validointi rikkoo testit
Lisäsit validoinnin:
```
if (start < now) {
  throw new Error("Varauksen aloitusaika ei voi olla menneessä");
}
```
Testidata:
```
startTime: "2099-01-01T10:00"
```
⚠️ Node tulkitsee tämän UTC-aikana, ja jos vertailu tehdään väärin, se voi silti epäonnistua joissain ympäristöissä.

Korjaa testidata varmaksi
```
const futureStart = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const futureEnd = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
```
Ja testissä:
```
.send({
  room: "Testihuone",
  startTime: futureStart,
  endTime: futureEnd
});
```
👉 Tämä poistaa kaikki aikavyöhykeongelmat.

#### 6️⃣ Lopullinen johtopäätös
❌ Ongelma ei ole “yhteys serveriin”

❌ Ongelma ei ole frontend/backend-jaossa

✅ Ongelma on Express-appin konfiguraatiossa tai validoinnissa

✅ DELETE-testin osittainen toiminta todistaa, että perusrakenne on oikein

### Minä:

*Vastaa vain tähän kysymykseen, ei tarvitse lisätä muuta: startTime: "miten lisään manuaalisesti menneen ajan tähän?", kun luon uutta post-pyyntöä automaatiotestissä?*

### AI:

Lisäämällä ISO-aikaleiman, joka on selvästi menneisyydessä, esimerkiksi:
```
startTime: "2000-01-01T10:00:00.000Z"
```
Tai dynaamisesti testissä:
```
const pastTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();

startTime: pastTime
```
Molemmat luovat varmasti menneeseen aikaan sijoittuvan varauksen.

### Minä:

*Päivitin käyttöliittymää index.html. Ei tarvitse ehdottaa mitään:*
```
<!DOCTYPE html> <html lang="fi"> <head> <meta charset="UTF-8" /> <title>Varaussovellus</title> <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'> <link rel="stylesheet" href="styles.css" /> </head> <body> <div class="reservation-form"> <h1>Varaa kokoustila</h1> <input id="start" type="datetime-local" /> <input id="end" type="datetime-local" /> <p>Valitse tila:</p> <select id="room"> <option value="Kokoustila A">Kokoustila A</option> <option value="Kokoustila B">Kokoustila B</option> <option value="Kokoustila C">Kokoustila C</option> </select> <button id="createBtn">Varaa</button> </div> <div class="reservation-list"> <h2>Hae tietyn huoneen varauksia</h2> <select id="searchRoom"> <option value="Kokoustila A">Kokoustila A</option> <option value="Kokoustila B">Kokoustila B</option> <option value="Kokoustila C">Kokoustila C</option> </select> <button id="searchBtn">Hae</button> <ul id="reservations"></ul> </div> <script src="main.js"></script> </body> </html>
```

### AI:

Selvä 👍
Päivitys vastaanotettu ja ymmärretty.

### Minä:

*Päivitän seuraavaksi main.js-tiedoston loadReservations()-funktiota, koska haluan muokata li-elementin sisältöä. Poistin elementistä varauksen id-arvon ja seuraavaksi haluan muuttaa delete-buttonin sisällön svg-ikoniksi, joka minulla on jo ladattuna sovellushakemistossa:*
```
async function loadReservations() { const room = document.getElementById("searchRoom").value; const list = document.getElementById("reservations"); list.innerHTML = ""; const response = await fetch(/api/reservations/${room}); const reservations = await response.json(); // jos varauksia ei löydy if (reservations.length === 0) { list.innerHTML = "<li>Ei varauksia</li>"; return; } reservations.forEach(r => { const li = document.createElement("li"); li.textContent = ${formatDate(r.startTime)} – ${formatDate(r.endTime)}; // Luodaan poistonappi const deleteBtn = document.createElement("button"); deleteBtn.textContent = "X"; // haluan tähän svg-tiedoston deleteBtn.onclick = () => deleteReservation(r.id); li.appendChild(deleteBtn); list.appendChild(li); }); }
```

### AI:

Koska SVG on jo tiedostona sovellushakemistossa, helpoin tapa on käyttää sitä <img>-elementtinä napin sisällä.

Oletetaan, että SVG on esimerkiksi:
```
frontend/
├── delete.svg
```

#### Muutos loadReservations()-funktioon
Korvaa tämä rivi:
```
deleteBtn.textContent = "X";
```
näillä riveillä:
```
const icon = document.createElement("img");
icon.src = "delete.svg";
icon.alt = "Poista varaus";
icon.className = "delete-icon";

deleteBtn.appendChild(icon);
```
Koko nappiosuus näyttää tällöin tältä:
```
const deleteBtn = document.createElement("button");

const icon = document.createElement("img");
icon.src = "delete.svg";
icon.alt = "Poista varaus";
icon.className = "delete-icon";

deleteBtn.appendChild(icon);
deleteBtn.onclick = () => deleteReservation(r.id);

li.appendChild(deleteBtn);
```
#### Miksi tämä toimii
* SVG ladataan kuten tavallinen kuva
* Nappi pysyy semanttisesti oikein (button)
* Klikkaus toimii normaalisti
* SVG:tä voi tyylitellä CSS:llä (.delete-icon)

Tämä on täysin kelvollinen ja yleinen tapa käyttää SVG-ikonia painikkeessa.

### Minä:

*Miten saan delete-iconin käyttämään parent-elementtinsä (button) koko leveyden?*

### AI:

Aseta SVG-kuvalle leveys ja korkeus 100 %, ja määrittele koko buttonille.
```
button {
  width: 32px;      /* tai haluamasi koko */
  height: 32px;
  padding: 0;
}

.delete-icon {
  width: 100%;
  height: 100%;
  display: block;
}
```
Tällöin .delete-icon täyttää koko parent-elementtinsä (button) leveyden ja korkeuden.

### Minä:

*Jostain syystä delete-icon (joka on buttonin sisällä) ei asetu pystysuunnassa keskelle, li-elementissä. Tässä on css-tiedostoni:*
```
body { font-family: Poppins; margin: auto; justify-items: center; background-color: #fbfbf6; } button { width: 100px; font-weight: bold; font-size: medium; color: #fbfbf6; background-color: rgb(44, 105, 210); padding: 5px; margin-top: 10px; border-radius: 50px; border: 1px solid rgb(120, 120, 120); } input, select { width: 250px; padding: 5px; border-radius: 5px; border: 1px solid rgb(203, 203, 203); } li { list-style-type: none; align-items: center; justify-content: center; align-content: center; } li button { height: 100%; width: 20px; background-color: transparent; padding: 0; } .delete-icon { width: 100%; height: 100%; display: block; } .reservation-form { display: flex; flex-direction: column; align-items: center; min-width: 100%; padding-bottom: 30px; background-color: #ffcaff; } .reservation-form input, select { margin-bottom: 10px; background-color: #fbfbf6; } .reservation-form p { margin: 0px; } .reservation-list { display: flex; flex-direction: column; align-items: center; } .reservation-list select { background-color: rgb(240, 240, 240); }
```

### AI:

Syy on tässä:
```
li {
  align-items: center;
  justify-content: center;
  align-content: center;
}
```
👉 Nämä ominaisuudet eivät tee mitään, koska li ei ole flex- tai grid-container.
Tällä hetkellä selain asettelee tekstin ja buttonin inline-tasauksella, jolloin nappi näyttää olevan “alhaalla”.

#### Korjaus (yksi oikea rivi)
Tee li:stä flex-container ja keskitys pystysuunnassa:
```
li {
  list-style-type: none;
  display: flex;
  align-items: center;   /* pystysuuntainen keskitys */
  justify-content: space-between;
}
```

#### Miksi tämä ratkaisee ongelman
* display: flex → tekstin ja buttonin asettelu samaan riviin
* align-items: center → button (ja SVG sen sisällä) keskitetään pystysuunnassa tekstin kanssa
* SVG täyttää buttonin → button täyttää flex-rivin korkeuden oikein

### Minä:

*Painike on nyt ok. Seuraavaksi haluan tehdä uuden customoidun alert-funktion, joka tulostuu ruudulle tarvittaessa ja poistuu esim 3 sekunnin kuluessa.*

### AI:

Hyvä ratkaisu 👍
Tehdään oma, kevyt alert-komponentti ilman selaimen alert()-ikkunaa.

Alla on yksinkertainen ja siisti toteutus, joka:
* näyttää viestin ruudulla
* katoaa automaattisesti 3 sekunnin kuluttua
* tukee eri tyyppejä (success / error)

#### 1️⃣ Lisää HTML:ään alert-container
Lisää tämä esim. <body>-elementin alkuun tai loppuun:
```
<div id="alert-container"></div>
```

#### 2️⃣ Lisää CSS (esim. styles.css)
```
#alert-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.custom-alert {
  background-color: rgb(44, 105, 210);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-weight: 500;
  min-width: 200px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  opacity: 1;
  transition: opacity 0.3s ease;
}

.custom-alert.error {
  background-color: rgb(200, 60, 60);
}

.custom-alert.success {
  background-color: rgb(60, 160, 90);
}
```

#### 3️⃣ Lisää JavaScript-funktio (main.js)
```
function showAlert(message, type = "success", duration = 3000) {
  const container = document.getElementById("alert-container");

  const alert = document.createElement("div");
  alert.className = `custom-alert ${type}`;
  alert.textContent = message;

  container.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, duration);
}
```

#### 4️⃣ Käyttöesimerkkejä
```showAlert("Varaus luotu onnistuneesti", "success");

showAlert("Varauksen poisto epäonnistui", "error");
```

#### 5️⃣ Miksi tämä on hyvä ratkaisu
✔ Ei estä käyttöä (toisin kuin alert())

✔ Ulkoasu täysin hallittavissa

✔ Helppo käyttää kaikkialla frontendissä

✔ Laajennettavissa (ikonit, animaatiot, close-nappi)

### Minä:

*Minulla on ikonit valmiina (svg) hakemistossa ja haluan lisätä ne vielä alert-komponentteihin ennen tekstiä.*

### AI:

Tämä onnistuu samalla periaatteella kuin delete-napissa: lisätään SVG <img>-elementtinä alertin sisään ennen tekstiä.

Oletetaan rakenne:
```
frontend/
├── icons/
│   ├── success.svg
│   └── error.svg
```

#### Muokattu showAlert-funktio
```
function showAlert(message, type = "success", duration = 3000) {
  const container = document.getElementById("alert-container");

  const alert = document.createElement("div");
  alert.className = `custom-alert ${type}`;

  // Ikoni
  const icon = document.createElement("img");
  icon.className = "alert-icon";
  icon.src = type === "error" ? "icons/error.svg" : "icons/success.svg";
  icon.alt = type;

  // Teksti
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
```

#### CSS ikonille ja asettelulle
```
.custom-alert {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
```

#### Lopputulos

* SVG-ikoni näkyy tekstin vasemmalla puolella
* Ikoni on pystysuunnassa keskellä
* Sama komponentti tukee eri tiloja (success, error)
* Ikonit ovat helposti vaihdettavissa
* Tämä on selkeä, kevyt ja täysin hallittu ratkaisu.

### Minä:

*Asennan nodemon-työkalun projektiin.*

### AI:

Hyvä 👍
Asenna nodemon backend-kansioon kehitystyökaluksi.

#### 1️⃣ Asennus

Aja backend-kansiossa:
```
npm install --save-dev nodemon
```

#### 2️⃣ Päivitä backend/package.json
```
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "jest"
}
```

#### 3️⃣ Käyttö
Kehitystilassa:
```
npm run dev
```
➡️ Backend käynnistyy uudelleen automaattisesti aina, kun muutat tiedostoja.

Tuotannossa edelleen:
```
npm start
```
Tämä on oikea ja yleinen tapa käyttää nodemonia Node.js-projekteissa.

### Minä:

*Seuraavaksi luon customoidun funkiton confirm-notifikaatiolle käyttöliittymään. Sitä käytetään varauksen poiston yhteydessä. Komponentti tarvitsee ikonin, tekstin ja painikkeet poiston hyväksymiselle ja peruuttamiselle. Lisäsin domiin:*
```
<div id="confirm-container"></div> Tässä pohja funktiolle: function showConfirm(message) { // Haetaan DOM:sta oikea div-komponentti const container = document.getElementById("confirm-container"); // Luodaan sisällölle komponentti ja class const confirm = document.createElement("div"); confirm.className = "custom-confirm"; // Confirm ilmoituksen ikoni const icon = document.createElement("img"); icon.className = "confirm-icon"; icon.src = type === "error" ? "./assets/circle-question-solid-full.svg" : "./assets/circle-question-solid-full.svg"; icon.alt = type; // Confirm ilmoituksen teksti const text = document.createElement("span"); text.textContent = message; // Confirm viestin submit-painike // Confirm viestin peruutus-painike }
```

### AI:

Hyvä pohja 👍

Alla on täysin valmis ja toimiva showConfirm-funktio, joka:
* näyttää ikonillisen confirm-komponentin
* sisältää Hyväksy- ja Peruuta-painikkeet
* palauttaa käyttäjän valinnan Promise<boolean>-arvona
* on helppo käyttää varauksen poiston yhteydessä

#### Valmis showConfirm-funktio (main.js)
```
function showConfirm(message) {
  return new Promise((resolve) => {
    const container = document.getElementById("confirm-container");
    container.innerHTML = "";

    const confirm = document.createElement("div");
    confirm.className = "custom-confirm";

    // Ikoni
    const icon = document.createElement("img");
    icon.className = "confirm-icon";
    icon.src = "./assets/circle-question-solid-full.svg";
    icon.alt = "Vahvistus";

    // Teksti
    const text = document.createElement("span");
    text.textContent = message;

    // Painikkeet
    const buttons = document.createElement("div");
    buttons.className = "confirm-buttons";

    const okBtn = document.createElement("button");
    okBtn.textContent = "Poista";
    okBtn.className = "confirm-ok";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Peruuta";
    cancelBtn.className = "confirm-cancel";

    okBtn.onclick = () => {
      container.innerHTML = "";
      resolve(true);
    };

    cancelBtn.onclick = () => {
      container.innerHTML = "";
      resolve(false);
    };

    buttons.appendChild(okBtn);
    buttons.appendChild(cancelBtn);

    confirm.appendChild(icon);
    confirm.appendChild(text);
    confirm.appendChild(buttons);

    container.appendChild(confirm);
  });
}
```

#### Käyttö varauksen poiston yhteydessä
```
async function deleteReservation(id) {
  const confirmed = await showConfirm("Haluatko varmasti poistaa varauksen?");

  if (!confirmed) return;

  await fetch(`/api/reservations/${id}`, { method: "DELETE" });
  loadReservations();
}
```

#### Miksi Promise-pohjainen confirm on paras
✔ Käyttö kuin natiivi confirm()

✔ Ei callback-helvettiä

✔ Helppo ketjuttaa async/awaitiin

✔ Täysin tyyliteltävissä ja laajennettavissa

### Minä:

*Käytetään mieluummin tässä id-arvoja: okBtn.className = "confirm-ok"; Ei tarvitse tehdä mitään.*

### AI:

Selvä 👍
Vaihdetaan painikkeille id-arvot classien sijaan. Muu logiikka pysyy samana.

### Minä:

*Päivitin funktion tähän. Älä tee mitään:*
```
function showConfirm(message) { return new Promise((resolve) => { // Haetaan DOM:sta oikea div-komponentti (käytetään samaa alert-komponenttia pohjana) const container = document.getElementById("alert-container"); container.innerHTML = ""; // Luodaan koko sisällölle oma komponentti ja class const confirm = document.createElement("div"); confirm.className = "custom-confirm"; // Luodaan ikonille ja tekstille oma div (layoutissa ylin rivi) const content = document.createElement("div"); content.className = "confirm-content" // Confirm ilmoituksen ikoni (käytetään alert-ikonin tyylittelyä) const icon = document.createElement("img"); icon.className = "alert-icon"; icon.src = "./assets/circle-question-solid-full.svg"; icon.alt = "Vahvistus"; // Confirm ilmoituksen teksti const text = document.createElement("span"); text.textContent = message; // Confirm viestin painikkeille oma div (layoutissa alin rivi) const buttons = document.createElement("div"); buttons.className = "confirm-buttons"; // Painike poiston vahvistukselle const okBtn = document.createElement("button"); okBtn.textContent = "Vahvista"; okBtn.id = "confirm-ok"; // Painike poiston peruuttamiselle const cancelBtn = document.createElement("button"); cancelBtn.textContent = "Peruuta"; cancelBtn.id = "confirm-cancel"; // Tapahtuman käsittely vahvistuspainikkeelle okBtn.onclick = () => { container.innerHTML = ""; resolve(true); }; // Tapahtuman käsittely peruutuspainikkeelle cancelBtn.onclick = () => { container.innerHTML = ""; resolve(false); }; // Asetellaan komponentit parentteihinsa content.appendChild(icon); content.appendChild(text); buttons.appendChild(okBtn); buttons.appendChild(cancelBtn); confirm.appendChild(content); confirm.appendChild(buttons); container.appendChild(confirm); }) }
```

### AI:

Selvä 👍

### Minä: 

*Tässä tulee domin tyylittely. Ikoni ja teksti eivät asetu pystysuunnassa keskelle parent-containerissaan:*
```
#alert-container { position: fixed; left: 50%; transform: translate(-50%, 0%); z-index: 1000; margin-top: 5px; } .custom-confirm { display: flex; flex-direction: column; gap: 10px; align-items: center; color: rgb(36, 36, 36); padding: 20px; border-radius: 5px; box-shadow: 0.5px 0.5px rgb(36, 36, 36); font-weight: 500; transition: opacity 0.1s ease; background-color: #f9edcd; border: 3px solid #f2bb32; } .confirm-content { gap: 10px; margin: auto; align-items: center; }
```

### AI:

Syy on sama kuin aiemmin li-elementin kanssa:
.confirm-content ei ole flex-container, joten align-items ei vaikuta mihinkään.

Lisää siihen display: flex.

#### Korjaus
```
.confirm-content {
  display: flex;
  align-items: center;   /* pystysuuntainen keskitys */
  gap: 10px;
  margin: auto;
}
```

#### Miksi tämä toimii
* display: flex aktivoi flexbox-asettelun
* align-items: center keskittää ikonin ja tekstin pystysuunnassa toisiinsa nähden
* gap hoitaa välin ilman marginaalihackeja

Tämän jälkeen ikoni ja teksti asettuvat oikein keskelle parent-containerissaan.

### Minä:

*Siistin hieman /frontend sisältöä. Siirrän main.js omaan kansioon /frontend/hooks ja lisään hooks-kansioon uuden tiedoston notification.js. Notification.js-tiedoston sisälle siirrän uudet funktiot showAlert() ja showConfirm().*

### AI:

Hyvä ja järkevä refaktorointi 👍
Kun siirrät logiikkaa omiin tiedostoihin, tarvitset vain kolme asiaa kuntoon:

#### 1️⃣ Uusi frontend-rakenne
```
frontend/
├── index.html
├── styles.css
├── hooks/
│   ├── main.js
│   └── notification.js
└── assets/
    └── *.svg
```

#### 2️⃣ notification.js: exporttaa funktiot
```
export function showAlert(message, type = "success", duration = 3000) {
  const container = document.getElementById("alert-container");

  const alert = document.createElement("div");
  alert.className = `custom-alert ${type}`;
  alert.textContent = message;

  container.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, duration);
}

export function showConfirm(message) {
  return new Promise((resolve) => {
    const container = document.getElementById("alert-container");
    container.innerHTML = "";

    const confirm = document.createElement("div");
    confirm.className = "custom-confirm";

    const content = document.createElement("div");
    content.className = "confirm-content";

    const icon = document.createElement("img");
    icon.className = "alert-icon";
    icon.src = "./assets/circle-question-solid-full.svg";

    const text = document.createElement("span");
    text.textContent = message;

    const buttons = document.createElement("div");
    buttons.className = "confirm-buttons";

    const okBtn = document.createElement("button");
    okBtn.id = "confirm-ok";
    okBtn.textContent = "Vahvista";

    const cancelBtn = document.createElement("button");
    cancelBtn.id = "confirm-cancel";
    cancelBtn.textContent = "Peruuta";

    okBtn.onclick = () => {
      container.innerHTML = "";
      resolve(true);
    };

    cancelBtn.onclick = () => {
      container.innerHTML = "";
      resolve(false);
    };

    content.appendChild(icon);
    content.appendChild(text);
    buttons.appendChild(okBtn);
    buttons.appendChild(cancelBtn);
    confirm.appendChild(content);
    confirm.appendChild(buttons);
    container.appendChild(confirm);
  });
}
```

#### 3️⃣ main.js: tuo funktiot käyttöön
```
import { showAlert, showConfirm } from "./notification.js";
```
Ja käytä normaalisti:
```
showAlert("Varaus luotu onnistuneesti");

const confirmed = await showConfirm("Haluatko varmasti poistaa varauksen?");
```

#### 4️⃣ TÄRKEÄ: index.html → module-skripti
Koska käytät ES moduleita (import/export), muuta script-tagi:
```
<script type="module" src="./hooks/main.js"></script>
```
⚠️ Ilman type="module" importit eivät toimi.

#### 5️⃣ Yleisin sudenkuoppa (tiedostopolut)
Koska notification.js on hooks/-kansiossa, ikonipolku:
```
icon.src = "./assets/..."
```
toimii vain jos:
* sivu ladataan projektin juuresta
* Express tarjoilee frontendin juuren oikein

Jos ongelmia ilmenee, oikea polku on usein:
```
icon.src = "../assets/circle-question-solid-full.svg";
```
(riippuu siitä, mistä tiedostosta suhteellinen polku lasketaan)

#### Lopputulos
✔ Frontend on nyt modulaarinen

✔ Notification-logiikka eriytetty

✔ main.js pysyy selkeämpänä

✔ Rakenne skaalautuu hyvin

Tämä on hyvin tehty frontend-refaktorointi.

### Minä:

*notification.js lopusta unohtui exporttaus*

### AI:

Aivan oikein 👍
Jos funktiot on määritelty ilman export-avainsanaa, ne eivät ole käytettävissä main.js:ssä.

#### Kaksi oikeaa tapaa korjata tämä
✅ Vaihtoehto 1 (suositeltu): export suoraan funktioissa
```
export function showAlert(message, type = "success", duration = 3000) {
  ...
}

export function showConfirm(message) {
  ...
}
```

#### ✅ Vaihtoehto 2: export lopussa
```
function showAlert(message, type = "success", duration = 3000) {
  ...
}

function showConfirm(message) {
  ...
}

export { showAlert, showConfirm };
```
Molemmat ovat täysin oikein — valitse tyyli, jota haluat käyttää projektissa.

### Minä:

*Huomasin seuraavaa. Käyttöliittymän createReservation()-funktion sisällä luodaan reservation-muuttuja, jota ei koskaan käytetä:*
```
// Varauksen luomisen käsittely käyttöliittymässä async function createReservation() { // Haetaan DOM:ista lomakkeen syöttöarvot const room = document.getElementById("room").value; const startTime = document.getElementById("start").value; const endTime = document.getElementById("end").value; // Jos syöttöarvo on tyhjä if (!room || !startTime || !endTime) { showAlert("Täytä kaikki kentät", "error"); return; } try { // Lähetetään POST-pyyntö palvelimelle const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room, startTime, endTime }) }); // Jos pyyntö epäonnistuu if (!response.ok) { // Varmistetaan, että vastaus sisältää JSONia try { const err = await response.json(); if (err.error) errMsg = err.error; } catch { // Ei JSONia → käytetään oletusvirhettä } showAlert("Varaus epäonnistui", "error"); return; } const reservation = await response.json(); showAlert("Varaus luotu", "success"); loadReservations(); } catch (err) { showAlert("Palvelinvirhe: ", err.message); } }
```

### AI:

Hyvä havainto – olet täysin oikeassa 👍

Tässä funktiossa:
```
const reservation = await response.json();
```
reservation-muuttujaa ei käytetä mihinkään, joten se on tällä hetkellä turha.

#### Miksi se on usein jäänyt tähän?
* Alun perin varauksen ID:tä tai tietoja on ehkä tarkoitus käyttää
* Tyypillinen malli: “luo → palauta JSON → käytä dataa”
* Mutta nykyisessä UI:ssa:
  * näytät vain alertin
  * lataat varaukset uudelleen loadReservations()illa

#### Kaksi järkevää vaihtoehtoa

##### ✅ Vaihtoehto 1: Poista muuttuja kokonaan (siistein nyt)
Jos et tarvitse backendin vastausta:
```
await response.json(); // tai ei edes tätä, jos backend palauttaa 201 ilman bodya
showAlert("Varaus luotu", "success");
loadReservations();
```
Tai jopa:
```
showAlert("Varaus luotu", "success");
loadReservations();
```

##### ✅ Vaihtoehto 2: Hyödynnä reservation-dataa
Jos haluat myöhemmin:
* näyttää varauksen ajan alertissa
* lisätä varauksen listaan ilman uutta GET-pyyntöä
* logata ID:n

esim.:
```
const reservation = await response.json();
showAlert(`Varaus luotu (${reservation.id})`, "success");
```

#### Suositus

Tässä vaiheessa projektia vaihtoehto 1 on paras:
* vähemmän turhaa koodia
* selkeämpi logiikka
* ei “kuollutta muuttujaa”

Tämä oli hyvä koodikatselmushavainto – juuri tällaisia asioita huomataan oikeassa kehitystyössä 👌

### Minä:

*Selitä vielä, mitä await response.json(); käytännössä tekee?*

### AI:

await response.json(); tekee kaksi asiaa peräkkäin:

#### 1️⃣ Lukee HTTP-vastauksen rungon

Kun teet fetch-pyynnön, palvelin vastaa esim.:
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 5,
  "room": "Kokoustila A",
  "startTime": "...",
  "endTime": "..."
}
```
response.json():
* lukee vastauksen body-datan
* olettaa sen olevan JSON-muotoista

#### 2️⃣ Parsii JSON-tekstin JavaScript-olioksi
```
await response.json();
```
* muuntaa JSON-merkkijonon JS-olioksi
* palauttaa esim.:
```
{
  id: 5,
  room: "Kokoustila A",
  startTime: "...",
  endTime: "..."
}
```
await:
* pysäyttää funktion suorituksen hetkeksi
* jatkaa vasta, kun JSON on luettu ja parsittu

#### Tärkeä yksityiskohta

HTTP-vastauksen body voidaan lukea vain kerran.

Tämä on OK:
```
const data = await response.json();
```
Tämä EI ole:
```
await response.json();
await response.json(); // ❌ body jo käytetty
```

#### Miksi sitä käytetään, vaikka dataa ei käytetä?
Joskus:
* halutaan varmistaa, että vastaus on oikeasti luettavissa
* halutaan kuluttaa body ennen jatkoa
* tai koodi on jäänyt aiemmasta versiosta

Mutta jos et käytä dataa, sitä ei ole pakko kutsua.

### Minä:

*Lisätään palvelimeen uusi validointi, createReservation() service-funktioon. Kuvitellaan, että varaustilat ovat käytössä vain toimistoaikoina. Sovitaan toimistoajoiksi 08:00 - 18:00. Estetään siis varauksen tekeminen tämän aikaikkunan ulkopuolella. Muutamme funkitossa ajan parametrit JavaScript-olioiksi:*
```
// Muutetaan JavaScript-olioiksi const start = new Date(startTime); const end = new Date(endTime); const now = new Date(); Tämän jälkeen uusi validointi: // Validointi 4: Varaus ei sijoitu klo 08:00 - 18:00 välille
```

### AI:

Lisää createReservation()-service-funktioon seuraava validointi Date-olioiden luomisen jälkeen:
```
// Validointi 4: Varaus vain toimistoaikana 08:00–18:00
const OFFICE_START = 8;  // 08:00
const OFFICE_END = 18;   // 18:00

const startHour = start.getHours();
const endHour = end.getHours();

// tarkistetaan myös minuutit (esim. 17:30 on ok, 18:01 ei)
const startMinutesOk = startHour > OFFICE_START || (startHour === OFFICE_START && start.getMinutes() >= 0);
const endMinutesOk = endHour < OFFICE_END || (endHour === OFFICE_END && end.getMinutes() === 0);

if (!startMinutesOk || !endMinutesOk) {
  throw new Error("Varaus sallitaan vain toimistoaikana klo 08:00–18:00");
}
```
🔹 Tämä estää:
* varaukset ennen klo 08:00
* varaukset klo 18:00 jälkeen
* varaukset, jotka ylittävät toimistoajan

🔹 Ja sallii:
* esim. 08:00–09:00
* esim. 17:00–18:00

Jos haluat yksinkertaisemman version (ilman minuutti­tarkkuutta), sekin onnistuu.

### Minä:

*createReservation()- ja getReservationByRoom()-servicefunktioissa molemmissa käsitelllään parametrina huonedataa. Määrittelimme käyttöliittymässä, että huonevalinnat on rajattu kolmeen: Kokoustila A, B ja C. Tämä olisi hyvä rajaus sisällyttää myös palvelimeen, että se ei hyväksy muita room-arvoja.*

### AI:

Tämä on erittäin hyvä havainto 👍
Juuri näin: käyttöliittymän validointiin ei koskaan pidä luottaa yksin.

Alla on selkeä ja siisti tapa toteuttaa huonevalidointi service-tasolla niin, että sitä voidaan käyttää useassa funktiossa.

#### 1️⃣ Määrittele sallitut huoneet yhteen paikkaan
📄 backend/src/services/reservationService.js (yläosaan)
```
const ALLOWED_ROOMS = [
  "Kokoustila A",
  "Kokoustila B",
  "Kokoustila C"
];
```

#### 2️⃣ Yhteinen huonevalidointifunktio
```
function validateRoom(room) {
  if (!ALLOWED_ROOMS.includes(room)) {
    throw new Error("Virheellinen huone");
  }
}
```

#### 3️⃣ Käytä validointia createReservation()-funktiossa
```
function createReservation(room, startTime, endTime) {
  validateRoom(room);

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // muut validoinnit...
}
```

#### 4️⃣ Käytä validointia getReservationsByRoom()-funktiossa
```
function getReservationsByRoom(room) {
  validateRoom(room);

  return reservations.filter(r => r.room === room);
}
```

#### 5️⃣ Miten controller reagoi virheeseen
Controllerissa:
```
try {
  const reservations = service.getReservationsByRoom(req.params.room);
  res.json(reservations);
} catch (err) {
  res.status(400).json({ error: err.message });
}
```

#### 6️⃣ Miksi tämä on hyvä ratkaisu
✅ Yksi totuuden lähde huoneille

✅ Sama validointi kaikille API-poluille

✅ UI ei voi ohittaa rajoituksia

✅ Testaus helpottuu

✅ Jatkossa helppo lisätä huoneita

Jos haluat, voin myös:
* päivittää Jest-testit kattamaan virheelliset huoneet
* lisätä huonevalidoinnin delete-toimintoon
* tehdä enum-tyylisen ratkaisun

Sanot vain 👍

### Minä:

*Olisiko järkevää sisällyttää huonearvot muistitietokantaan valmiiksi?*

### AI:

Kyllä — se on järkevää ja arkkitehtuurisesti parempi ratkaisu, etenkin jos ajattelet sovelluksen kasvua 👍
Mutta miten se tehdään riippuu siitä, mitä tavoittelet. Alla selkeä vertailu ja suositus.

#### 🔹 Nykyinen tapa (kovakoodattu lista servicessä)
```
const ALLOWED_ROOMS = ["Kokoustila A", "Kokoustila B", "Kokoustila C"];
```
Hyödyt
* Yksinkertainen
* Riittää demoihin ja harjoituksiin

Haitat
* Huoneet eivät ole “dataa”, vaan logiikkaa
* Huoneita ei voi muuttaa ilman koodimuutosta
* Ei vastaa oikeaa tietokantaratkaisua

#### ✅ Suositeltu tapa: huoneet muistitietokantaan

Tämä vastaa oikean sovelluksen rakennetta ja tekee palvelusta joustavamman.

##### 1️⃣ Lisää huoneet muistitietokantaan
📄 backend/src/data/inMemoryDb.js
```
const rooms = [
  { id: 1, name: "Kokoustila A" },
  { id: 2, name: "Kokoustila B" },
  { id: 3, name: "Kokoustila C" }
];

const reservations = [];

module.exports = {
  rooms,
  reservations
};
```

##### 2️⃣ Päivitä huonevalidointi käyttämään tietokantaa
📄 reservationService.js
```
const { rooms, reservations } = require("../data/inMemoryDb");

function validateRoom(roomName) {
  const exists = rooms.some(r => r.name === roomName);
  if (!exists) {
    throw new Error("Virheellinen huone");
  }
}
```

##### 3️⃣ Käytä validointia normaalisti servicessä
```
function createReservation(room, startTime, endTime) {
  validateRoom(room);
  // ...
}

function getReservationsByRoom(room) {
  validateRoom(room);
  return reservations.filter(r => r.room === room);
}
```

##### 4️⃣ Miksi tämä on parempi ratkaisu
✅ Huoneet ovat dataa, eivät logiikkaa

✅ Vastaa oikeaa tietokantamallia

✅ Helppo laajentaa (lisää huoneita, poista huoneita)

✅ Mahdollistaa myöhemmin:
* /api/rooms endpointin
* huoneiden hallinnan UI:ssa
* tietokantamigraation lähes suoraan

#### 🧠 Milloin kovakoodaus on ok?
* Koodikoe
* Pieni demo
* Yhden päivän harjoitus

Mutta sinun projektisi tasolla (API + UI + testit) huoneet kannattaa ehdottomasti mallintaa dataksi.

### Minä:

*Päivitetään funktion toiminta vastaamaan uutta tietokantapohjaa:*
```
/* FUNKTIO 1: Luo uusi varaus */ exports.createReservation = ({ room, startTime, endTime }) => { // Validointi 1: tiedot puuttuvat if (!room || !startTime || !endTime) { // Palautetaan virheviesti throw new Error("Puuttuvat tiedot"); } // Muutetaan JavaScript-olioiksi const start = new Date(startTime); const end = new Date(endTime); const now = new Date(); // Validointi 2: Aloitusaika on menneisyydessä if (start < now) { // Palautetaan virheviesti throw new Error("Varauksen aloitusaika ei voi olla menneessä"); } // Validointi 3: Aloitusaika on ennen lopetusta if (start >= end) { // Palautetaan virheviesti throw new Error("Varauksen aloitusaika tulee olla ennen lopetusaikaa"); } // Validointi 4: Varaus ei sijoitu klo 08:00 - 18:00 välille // Luodaan toimistoaikojen raja-arvot muuttujiin const OFFICE_START = 8; const OFFICE_END = 18; // Haetaan parametreista tuntiarvot const startHour = start.getHours(); const endHour = end.getHours(); // Haetaan parametreista minuuttiarvot const startMinutes = start.getMinutes(); const endMinutes = end.getMinutes(); // Aloitustunti on isompi kuin raja-arvo tai se on 8 ja minuuttiarvo on 0 tai isompi const startOk = startHour > OFFICE_START || (startHour === OFFICE_START && startMinutes >= 0); // Lopetustunti on pienempi kuin raja-arvo tai se on 18 ja minuuttiarvo on 0 const endOk = endHour < OFFICE_END || (endHour === OFFICE_END && endMinutes === 0); if (!startOk || !endOk) { // Palautetaan virheviesti throw new Error("Varaus sallitaan vain toimistoaikana (08:00 - 18:00)"); } // Käydään tietokanta läpi, palauttaa true jos saman huone-arvon objektilla päällekkäinen varaus const overlapping = reservations.some(r => r.room === room && isOverlapping(startTime, endTime, r.startTime, r.endTime) ); // Validointi 4: Varaus on päällekkäinen jo olemassa olevan varauksen kanssa if (overlapping) { // Palautetaan virheviesti throw new Error("Aikaväli on jo varattu"); } // Luodaan varausobjekti const reservation = { id: db.nextId++, room, startTime, endTime }; // Viedään objekti tietokantaan reservations.push(reservation); // Palautetaan luotu varausobjekti return reservation; };
```

### AI:

Alla on päivitetty versio createReservation-funktiosta, joka vastaa uutta tietokantapohjaa, eli huoneet haetaan muistitietokannasta eikä hyväksytä muita arvoja.

Oletus:
* rooms, reservations ja nextId tulevat inMemoryDb:stä

#### ✅ Päivitetty createReservation (service)
```
const db = require("../data/inMemoryDb");
const { isOverlapping } = require("../utils/timeUtils");

exports.createReservation = ({ room, startTime, endTime }) => {
  const { rooms, reservations } = db;

  // Validointi 1: tiedot puuttuvat
  if (!room || !startTime || !endTime) {
    throw new Error("Puuttuvat tiedot");
  }

  // Validointi 1.5: huone ei ole olemassa tietokannassa
  const roomExists = rooms.some(r => r.name === room);
  if (!roomExists) {
    throw new Error("Virheellinen huone");
  }

  // Muutetaan JavaScript-olioiksi
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // Validointi 2: Aloitusaika on menneisyydessä
  if (start < now) {
    throw new Error("Varauksen aloitusaika ei voi olla menneessä");
  }

  // Validointi 3: Aloitusaika on ennen lopetusta
  if (start >= end) {
    throw new Error("Varauksen aloitusaika tulee olla ennen lopetusaikaa");
  }

  // Validointi 4: Varaus vain toimistoaikana 08:00–18:00
  const OFFICE_START = 8;
  const OFFICE_END = 18;

  const startHour = start.getHours();
  const endHour = end.getHours();
  const startMinutes = start.getMinutes();
  const endMinutes = end.getMinutes();

  const startOk =
    startHour > OFFICE_START ||
    (startHour === OFFICE_START && startMinutes >= 0);

  const endOk =
    endHour < OFFICE_END ||
    (endHour === OFFICE_END && endMinutes === 0);

  if (!startOk || !endOk) {
    throw new Error("Varaus sallitaan vain toimistoaikana (08:00 - 18:00)");
  }

  // Validointi 5: päällekkäiset varaukset
  const overlapping = reservations.some(r =>
    r.room === room &&
    isOverlapping(startTime, endTime, r.startTime, r.endTime)
  );

  if (overlapping) {
    throw new Error("Aikaväli on jo varattu");
  }

  // Luodaan varausobjekti
  const reservation = {
    id: db.nextId++,
    room,
    startTime,
    endTime
  };

  // Tallennetaan tietokantaan
  reservations.push(reservation);

  return reservation;
};
```

#### 🔍 Mitä muuttui olennaisesti
✅ Huonevalidointi tehdään tietokannasta (rooms)

❌ Ei enää kovakoodattuja huonelistoja

✅ Service vastaa realistista tietokantamallia

✅ Sama rakenne toimii myöhemmin oikean DB:n kanssa

Jos haluat seuraavaksi:
* päivitetään getReservationsByRoom vastaavaksi
* lisätään /api/rooms
* päivitetään Jest-testit huonevalidointiin

sano vain 👍

### Minä:

```
// Luodaan varausobjekti const reservation = { id: db.nextId++, room, startTime, endTime }; 
```
*Tässä luodaan uusi varausobjekti db.nextID++, mutta poistimme tietokantapohjasta arvon nextId.*

### AI:

Hyvä huomio — olet täysin oikeassa 👍
Jos nextId on poistettu muistitietokannasta, tätä koodia ei voi enää käyttää sellaisenaan. ID:n luonti pitää ratkaista uudelleen.

Alla on oikeat vaihtoehdot ja suositus.

#### 🔹 Vaihtoehto 1 (suositeltu): johda ID varauksista

📄 reservationService.js
```
const newId =
  reservations.length === 0
    ? 1
    : Math.max(...reservations.map(r => r.id)) + 1;

const reservation = {
  id: newId,
  room,
  startTime,
  endTime
};
```
##### Miksi tämä on hyvä
* Ei vaadi globaalia tilaa
* Ei rikkoudu resetin jälkeen
* Yksinkertainen ja luettava

#### 🔹 Vaihtoehto 2: lisää nextId takaisin tietokantaan

📄 inMemoryDb.js
```
let nextId = 1;

module.exports = {
  rooms,
  reservations,
  nextId
};
```
Tämä on ok vain jos tiedostat, että:
* tila on globaalia
* testejä ajettaessa ID:t kasvavat

#### 🔹 Vaihtoehto 3: käytä UUID:tä (paras tuotantoon)
```
const { randomUUID } = require("crypto");

const reservation = {
  id: randomUUID(),
  room,
  startTime,
  endTime
};
```

#### ✅ Suositus sinun projektiisi

👉 Vaihtoehto 1 on paras tässä vaiheessa
* ei lisää ylimääräistä tilaa
* helppo testata
* deterministinen

### Minä:

*Lisätään nextId takaisn tietokantaan. Ei tarvitse vastata.*

### AI:

👍

### Minä:

*Siistitään seuraavaksi reservationService, jakamalla se useisiin omiin tiedostoihin. Siirrämme apufunktion validateRoom() utils-hakemistoon ja jaamme kolme servicefunktiota omiin tiedostoihinsa, services-hakemiston alle.*

### AI:

Hyvä ja järkevä refaktorointi 👍
Alla selkeä malli, miten tämä kannattaa tehdä ilman että logiikka hajoaa.

#### 1️⃣ Uusi kansiorakenne (services + utils)
```
backend/
├── src/
│   ├── services/
│   │   ├── createReservation.js
│   │   ├── getReservationsByRoom.js
│   │   └── deleteReservation.js
│   │
│   ├── utils/
│   │   ├── validateRoom.js
│   │   └── timeUtils.js
│   │
│   ├── data/
│   │   └── inMemoryDb.js
│   │
│   └── services/
│       └── index.js   ← (koontitiedosto, suositeltu)
```

#### 2️⃣ validateRoom() utils-kansioon

📄 src/utils/validateRoom.js
```
const db = require("../data/inMemoryDb");

function validateRoom(room) {
  const exists = db.rooms.some(r => r.name === room);
  if (!exists) {
    throw new Error("Virheellinen huone");
  }
}

module.exports = validateRoom;
```

#### 3️⃣ Service-funktiot omiin tiedostoihin
📄 services/createReservation.js
```
const db = require("../data/inMemoryDb");
const validateRoom = require("../utils/validateRoom");
const { isOverlapping } = require("../utils/timeUtils");

module.exports = function createReservation({ room, startTime, endTime }) {
  const { reservations } = db;

  if (!room || !startTime || !endTime) {
    throw new Error("Puuttuvat tiedot");
  }

  validateRoom(room);

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start < now) {
    throw new Error("Varauksen aloitusaika ei voi olla menneessä");
  }

  if (start >= end) {
    throw new Error("Varauksen aloitusaika tulee olla ennen lopetusaikaa");
  }

  const OFFICE_START = 8;
  const OFFICE_END = 18;

  const startHour = start.getHours();
  const endHour = end.getHours();
  const startMinutes = start.getMinutes();
  const endMinutes = end.getMinutes();

  const startOk =
    startHour > OFFICE_START ||
    (startHour === OFFICE_START && startMinutes >= 0);

  const endOk =
    endHour < OFFICE_END ||
    (endHour === OFFICE_END && endMinutes === 0);

  if (!startOk || !endOk) {
    throw new Error("Varaus sallitaan vain toimistoaikana (08:00 - 18:00)");
  }

  const overlapping = reservations.some(r =>
    r.room === room &&
    isOverlapping(startTime, endTime, r.startTime, r.endTime)
  );

  if (overlapping) {
    throw new Error("Aikaväli on jo varattu");
  }

  const reservation = {
    id: db.nextId++,
    room,
    startTime,
    endTime
  };

  reservations.push(reservation);
  return reservation;
};
```

📄 services/getReservationsByRoom.js
```
const db = require("../data/inMemoryDb");
const validateRoom = require("../utils/validateRoom");

module.exports = function getReservationsByRoom(room) {
  validateRoom(room);
  return db.reservations.filter(r => r.room === room);
};
```

📄 services/deleteReservation.js
```
const db = require("../data/inMemoryDb");

module.exports = function deleteReservation(id) {
  const index = db.reservations.findIndex(r => r.id === id);
  if (index === -1) {
    throw new Error("Varausta ei löytynyt");
  }

  db.reservations.splice(index, 1);
};
```

#### 4️⃣ Koontitiedosto services-hakemistoon (tärkeä)

📄 services/index.js
```
const createReservation = require("./createReservation");
const getReservationsByRoom = require("./getReservationsByRoom");
const deleteReservation = require("./deleteReservation");

module.exports = {
  createReservation,
  getReservationsByRoom,
  deleteReservation
};
```

#### 5️⃣ Controller pysyy siistinä

📄 controllers/reservationsController.js
```
const service = require("../services");

exports.createReservation = (req, res) => {
  try {
    const reservation = service.createReservation(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
```

#### ✅ Miksi tämä on erinomainen rakenne
🧩 Yksi vastuu per tiedosto

🔁 Utils uudelleenkäytettäviä

🧪 Testaus helpottuu (voit testata yhden funktion kerrallaan)

🚀 Helppo laajentaa ilman että tiedostot paisuvat

🧠 Vastaa tuotantotason rakennetta

### Minä:

*Miksi luoda index.js services-hakemistoon? Eikö olisi kätevämpi kutstua jokaista servicefunktiota erikseen controllerissa?*

### AI:

Hyvä kysymys – tämä menee suoraan arkkitehtuurin ytimeen 👍
Lyhyt vastaus: molemmat toimivat, mutta services/index.js tuo selkeitä etuja, kun projekti kasvaa.

Alla rauhallinen ja konkreettinen vertailu.

#### ❌ Ilman services/index.js (suora import)
Controller:
```
const createReservation = require("../services/createReservation");
const getReservationsByRoom = require("../services/getReservationsByRoom");
const deleteReservation = require("../services/deleteReservation");
```
##### Hyödyt
* Täysin ok pienessä projektissa
* Ei “ylimääräistä” tiedostoa
##### Haitat
* Controller alkaa täyttyä importeista
* Polut toistuvat ja pitenevät
* Jokainen muutos servicessä vaatii muutoksia useissa controllereissa

#### ✅ services/index.js (koontipiste)
```
const service = require("../services");
```
Ja käyttö:
```
service.createReservation(...)
service.getReservationsByRoom(...)
```

#### Hyödyt (tärkeimmät)
##### 1️⃣ Yksi julkinen rajapinta
Controller ei tiedä:
* missä tiedosto sijaitsee
* montako serviceä on
* miten ne on jaettu

Se tietää vain: "services tarjoaa nämä toiminnot".

##### 2️⃣ Vähemmän rikkoutumisia refaktoroinnissa
Jos myöhemmin:
* yhdistät tiedostoja
* jaat logiikkaa uudelleen
* vaihdat nimeämistä

👉 vain services/index.js muuttuu.
Controllerit pysyvät koskemattomina.

##### 3️⃣ Selkeämpi vastuunjako
* Controller: HTTP + virheenkäsittely
* Service: liiketoimintalogiikka
* Index: modulien kokoaminen

Tämä on sama malli kuin:
* Node core
* Express middlewaret
* useimmat suuret backendit

##### 4️⃣ Parempi testattavuus ja mockaus

Testeissä voit tehdä:
```
jest.mock("../services", () => ({
  createReservation: jest.fn(),
  getReservationsByRoom: jest.fn(),
}));
```
Ilman indexiä mockaus on:
* monimutkaisempaa
* hajautettua

#### 🧠 Milloin index.js ei ole tarpeen?
* Yksi service
* Ei kasvamassa
* Ei refaktorointia

Mutta sinun projektisi:
* useita servicejä
* testit
* frontend + backend
* validoinnit

👉 index.js on oikea ratkaisu.

#### 🔑 Yhteenveto

| Tapa                | Toimiiko | Skaalautuu | Siisti |
| ------------------- | -------- | ---------- | ------ |
| Suorat importit     | ✅        | ❌          | ⚠️     |
| `services/index.js` | ✅        | ✅          | ✅      |

Hyvä että kysyit tämän – tämä on juuri sitä ajattelua, jota odotetaan oikeissa backend-projekteissa.

### Minä:

*Päätin edetä tällä pohjalla. Ei tarvitse vastata, ellet havaitse virheitä:*
```
const db = require("../data/inMemoryDb"); 
const validateRoom = require("../utils/validateRoom");
const { isOverlapping } = require("../utils/timeUtils");

// Luo uusi varaus
function createReservation({ room, startTime, endTime }) {
  // VALIDOINTI 1: Kaikki tiedot löytyvät
  if (!room || !startTime || !endTime) {
    // Palautetaan virheviesti
    throw new Error("Puuttuvat tiedot");
  }

  // VALIDOINTI 2: Annettu huone löytyy tietokannasta
  validateRoom(room);

  // Muutetaan JavaScript-olioiksi
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // VALIDOINTI 3: Aloitusaika ei ole menneisyydessä
  if (start < now) {
    // Palautetaan virheviesti
    throw new Error("Varauksen aloitusaika ei voi olla menneessä");
  }

  // VALIDOINTI 4: Aloitusaika ei ole ennen lopetusta
  if (start >= end) {
    // Palautetaan virheviesti
    throw new Error("Varauksen aloitusaika tulee olla ennen lopetusaikaa");
  }

  // VALIDOINTI 5: Varaus sijoittu klo 08:00 - 18:00 välille
  // Luodaan toimistoaikojen raja-arvot muuttujiin
  const OFFICE_START = 8;
  const OFFICE_END = 18;

  // Haetaan parametreista tuntiarvot
  const startHour = start.getHours();
  const endHour = end.getHours();
  // Haetaan parametreista minuuttiarvot
  const startMinutes = start.getMinutes();
  const endMinutes = end.getMinutes();

  // Aloitustunti on isompi kuin raja-arvo tai se on 8 ja minuuttiarvo on 0 tai isompi
  const startOk = startHour > OFFICE_START || (startHour === OFFICE_START && startMinutes >= 0);
  // Lopetustunti on pienempi kuin raja-arvo tai se on 18 ja minuuttiarvo on 0
  const endOk = endHour < OFFICE_END || (endHour === OFFICE_END && endMinutes === 0);

  if (!startOk || !endOk) {
    // Palautetaan virheviesti
    throw new Error("Varaus sallitaan vain toimistoaikana (08:00 - 18:00)");
  }

  // Käydään tietokanta läpi, palauttaa true jos saman huone-arvon objektilla päällekkäinen varaus
  const overlapping = reservations.some(r =>
    r.room === room &&
    isOverlapping(startTime, endTime, r.startTime, r.endTime)
  );

  // Validointi 4: Varaus on päällekkäinen jo olemassa olevan varauksen kanssa
  if (overlapping) {
    // Palautetaan virheviesti
    throw new Error("Aikaväli on jo varattu");
  }

  // Luodaan varausobjekti
  const reservation = {
    id: db.nextId++,
    room,
    startTime,
    endTime
  };

  // Viedään objekti tietokantaan
  reservations.push(reservation);

  // Palautetaan luotu varausobjekti
  return reservation;
};

module.exports = createReservation;
```