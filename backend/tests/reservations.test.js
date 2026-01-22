const request = require("supertest");
const app = require("../src/app");

// Ryhmitetään varaus API:n testit
describe("Reservations API - testit", () => {
  // Asetetaan ryhmän globaalit muuttujat
  let reservationId;
  const futureStart = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const futureEnd = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const pastTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // TESTI 1: varauksen luonti
  test("POST /api/reservations - luo varaus", async () => {
    // Lähetetään palvelimelle POST-pyyntö
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Kokoustila A",
        startTime: futureStart,
        endTime: futureEnd
      });

    // Oletetaan status-koodia 201 (created)
    expect(response.statusCode).toBe(201);
    // Oletetaan id-arvon palauttavan jotain
    expect(response.body.id).toBeDefined();
    // Oletetaan vastauksen body-datan room-kentän sisältö
    expect(response.body.room).toBe("Kokoustila A");

    // Päivitetään varaus id -muuttujan arvo seuraavia testejä varten
    reservationId = response.body.id;
  });

  // TESTI 2: varausten katselu
  test("GET /api/reservations/:room - listaa varaukset", async () => {
    // Lähetetään palvelimelle GET-pyyntö
    const response = await request(app)
      .get("/api/reservations/Kokoustila A");

    // Oletetaan vastauksen sisältävät status-koodin 200 (OK)
    expect(response.statusCode).toBe(200);
    // Oletetaan vastauksen bodyn olevan array
    expect(Array.isArray(response.body)).toBe(true);
    // Oletetaan vastauksen body-datan sisältävän jotain
    expect(response.body.length).toBeGreaterThan(0);
    // Oletetaan vastauksen body-datan ensimmäisen objektin room-kentän sisältö
    expect(response.body[0].room).toBe("Kokoustila A");
  });

  // TESTI 3: varauksen peruutus
  test("DELETE /api/reservations/:id - poista varaus", async () => {
    // Lähetetään palvelimelle DELETE-pyyntö
    const response = await request(app)
      .delete(`/api/reservations/${reservationId}`);

    // Oletetaan vastauksen sisältävän status-koodin 204 (no content)
    expect(response.statusCode).toBe(204);
  });

  // TESTI 4: peruutuksen epäonnistuminen (ei löydy)
  test("DELETE /api/reservations/:id - epäonnistuu, jos varaus ei ole olemassa", async () => {
    // Lähetetään palvelimelle DELETE-pyyntö
    const response = await request(app)
      .delete("/api/reservations/9999");

    // Oletetaan vastauksen sisältävän status-koodin 404 (not found)
    expect(response.statusCode).toBe(404);
    // Oletetaan vastauksen body-datan error-kentän sisältö
    expect(response.body.error).toBe("Varausta ei löytynyt");
  });

  // TESTI 5: päällekkäisen varauksen estäminen
  test("POST /api/reservations - estää päällekkäisen varauksen", async () => {
    // Lähetetään palvelimelle ensimmäinen POST-pyyntö
    await request(app)
      .post("/api/reservations")
      .send({
        room: "Kokoustila C",
        startTime: futureStart,
        endTime: futureEnd
      });

    // Lähetetään toinen POST-pyyntö päällekkäisellä ajalla
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Kokoustila C",
        startTime: futureStart,
        endTime: futureEnd
      });

    // Oletetaan vastauksen sisältävän status-koodin 400 (bad request)
    expect(response.statusCode).toBe(400);
    // Oletetaan vastauksen body-datan error-kentän sisältö
    expect(response.body.error).toBe("Aikaväli on jo varattu");
  });

  // TESTI 6: estetään varaus, kun aloitusaika on menneisyydessä
  test("POST /api/reservations - estää varauksen menneellä aloitusajalla", async () => {
    // Lähetetään palvelimelle virheellinen POST-pyyntö
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Kokoustila A",
        startTime: pastTime,
        endTime: futureEnd
      });

      // Oletetaan vastauksen sisältävän status-koodin 400 (bad request)
      expect(response.statusCode).toBe(400); // bad request
      // Oletetaan vastauksen body-datan error-kentän sisältö
      expect(response.body.error).toBe("Varauksen aloitusaika ei voi olla menneessä");
  });

  // TESTI 7: estetään varaus, kun lopetusaika on ennen aloitusaikaa
  test("POST /api/reservations - estää varauksen lopetusajan ollessa ennen aloitusaikaa", async () => {
    // Lähetetään palvelimelle virheellinen POST-pyyntö
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Kokoustila A",
        startTime: futureStart,
        endTime: pastTime
      });

      // Oletetaan vastauksen sisältävän status-koodin 400 (bad request)
      expect(response.statusCode).toBe(400);
      // Oletetaan vastauksen body-datan error-kentän sisältö
      expect(response.body.error).toBe("Varauksen aloitusaika tulee olla ennen lopetusaikaa");
  });

   // TESTI 8: estetään varaus, kun varausaika on toimistoajan ulkopuolella (08:00 - 18:00)
  test("POST /api/reservations - estää varauksen toimistoajan ulkopuolella", async () => {
    // Lähetetään palvelimelle virheellinen POST-pyyntö
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Kokoustila A",
        startTime: futureStart,
        endTime: "2026-01-29T18:30"
      });

      // Oletetaan vastauksen sisältävän status-koodin 400 (bad request)
      expect(response.statusCode).toBe(400);
      // Oletetaan vastauksen body-datan error-kentän sisältö
      expect(response.body.error).toBe("Varaus sallitaan vain toimistoaikana (08:00 - 18:00)");
  });
});
