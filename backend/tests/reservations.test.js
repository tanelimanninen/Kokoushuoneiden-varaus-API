const request = require("supertest");
const app = require("../src/app");

describe("Reservations API - testit", () => {
  let reservationId;
  const futureStart = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const futureEnd = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const pastTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // TESTI 1: varauksen luonti
  test("POST /api/reservations - luo varaus", async () => {
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Testihuone",
        startTime: futureStart,
        endTime: futureEnd
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.room).toBe("Testihuone");
    reservationId = response.body.id;
  });

  // TESTI 2: varausten katselu
  test("GET /api/reservations/:room - listaa varaukset", async () => {
    const response = await request(app)
      .get("/api/reservations/Testihuone");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].room).toBe("Testihuone");
  });

  // TESTI 3: varauksen peruutus
  test("DELETE /api/reservations/:id - poista varaus", async () => {
    const response = await request(app)
      .delete(`/api/reservations/${reservationId}`);

    expect(response.statusCode).toBe(204);
  });

  // TESTI 4: peruutuksen epäonnistuminen (ei löydy)
  test("DELETE /api/reservations/:id - epäonnistuu, jos varaus ei ole olemassa", async () => {
    const response = await request(app)
      .delete("/api/reservations/9999");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Varausta ei löytynyt");
  });

  // TESTI 5: päällekkäisen varauksen estäminen
  test("POST /api/reservations - estää päällekkäisen varauksen", async () => {
    // Luo ensimmäinen varaus
    await request(app)
      .post("/api/reservations")
      .send({
        room: "OverlapHuone",
        startTime: futureStart,
        endTime: futureEnd
      });

    // Yritä päällekkäistä
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "OverlapHuone",
        startTime: futureStart,
        endTime: futureEnd
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Aikaväli on jo varattu");
  });

  // TESTI 6: estetään varaus, kun aloitusaika on menneisyydessä
  test("POST /api/reservations - estää varauksen menneellä aloitusajalla", async () => {
    // luodaan virheellinen varaus
    const response = await request(app)
      .post("/api/reservations")
      .send({
        room: "Testihuone",
        startTime: pastTime,
        endTime: futureEnd
      });

      expect(response.statusCode).toBe(400); // bad request
      expect(response.body.error).toBe("Varauksen aloitusaika ei voi olla menneessä");
  })
});
