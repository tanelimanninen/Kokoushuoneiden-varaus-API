# Kokoushuoneiden-varaus-API

Tämä sovellus on ennakkotehtävä Vincitille, osana rekrytointiprosessia. Se on toteutettu tammikuussa vuonna 2026.

## 🖥 Kehitysversion asennusohje

Tämä ohje neuvoo, miten sovellus ajetaan lokaalisti kehitysympäristössä, tästä GitHub-repositoriosta.

### 🔧 1. Vaatimukset

Varmista, että seuraavat työkalut on asennettu koneellesi:

* Node.js (suositus: LTS-versio)

👉 https://nodejs.org/en/download

Tarkista asennus terminaalissa:
```
node -v
npm -v
```

* Git

👉 https://git-scm.com

Tarkista jälleen:
```
git --version
```

### 📥 2. Projektin kloonaus GitHubista

Klikkaa tämän repositorion näkymän yläreunassa code-painiketta ja kopioi web URL.

![Git-repositorion kloonaus code-painikkeesta.](/assets/git-kloonaus.png "Git-repositorion kloonaus code-painikkeesta.")

Kloonaa projekti valitsemaasi hakemistoon kopioidulla web ULR:illa:
```
git clone https://github.com/tanelimanninen/Kokoushuoneiden-varaus-API.git
```
Siirry projektin juureen:
```
cd Kokoushuoneiden-varaus-API
```
Projektihakemiston rakenne:
```
Kokoushuoneiden-varaus-API/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── assets/
│       └── svg-tiedostot
│   └── hooks/
│       └── js-tiedostot
│
└── backend/
    ├── controllers/ 
        └── controller-funktiot
    ├── data/
        └── muistitietokanta
    ├── routes/
        └── reititys
    ├── services/
        └── service-funktiot
    ├── src/
        └── juurikansio
    ├── tests/
        └── API-testit
    ├── utils/
        └── apufunktiot
    ├── package-lock.json
    ├── package.json
    ├── .gitignore
    └── md-tiedostot
```

### 📦 3. Backendin riippuvuuksien asennus

Siirry backend-kansioon ja asenna npm-riippuvuudet:
```
cd backend
npm install
```
Tämä luo tarvittavan node_modules-hakemiston (ei versionhallinnassa).

### ⚙️ 4. Ympäristömuuttujat

Lisää backend-kansioon tarvittava .env-tiedosto:

📄 backend/.env
```
// esimerkki porttimuuttujalle
PORT=3000
```

### ▶️ 5. Palvelimen käynnistys

Backend käynnistetään backend-kansiosta:

#### Normaali käynnistys
```
npm start
```
#### Kehitystila
```
npm run dev
```

Onnistuneen käynnistyksen jälkeen konsoliin tulostuu:
```
Server running on port 3000
Open UI from here: http://localhost:{.env-tiedoston_portin_numero}/
```

Käyttöliittymä toimii nyt konsoliin tulostetussa URL:issa

API:t toimivat nyt osoitteessa:
```
http://localhost:{portin_numero}/api/reservations/
```

### 🧪 6. Backend-testien ajaminen (Jest)

Projekti sisältää testit kolmen eri API-pyynnön suorittamiselle (GET, POST, DELETE). Lisäksi testejä on sisällytetty POST-pyynnön validoinnille.

Testit ajetaan ilman serverin käynnistämistä. 

Backend-kansiossa:
```
npm test
```
Testit käyttävät Express-sovellusta suoraan (app.js), eivät avaa porttia.

### 🔁 7. Yleisiä huomioita

* Backend ja frontend ajetaan erillään
* Frontend ei tarvitse npm-asennuksia
* Backendin virheet ja logit näkyvät Node-konsolissa
* Selainkonsoli (DevTools) näyttää frontend-virheet

### ✅ 8. Tyypillinen kehitystyönkulku
```
// Terminal 1
cd backend
npm run dev

// Selain
avaa http://localhost:{portin_numero}/
```