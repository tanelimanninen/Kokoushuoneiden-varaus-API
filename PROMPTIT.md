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