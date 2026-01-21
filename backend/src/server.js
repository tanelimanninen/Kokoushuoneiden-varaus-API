const app = require("./app");
require("dotenv").config();

// Haetaan 
const PORT = process.env.PORT;

// Käynnistää palvelimen
app.listen(PORT, () => {
  // Tulostetaan konsoliin tietoja
  console.log(`Server running on port ${PORT}`);
  console.log(`Open UI from here: http://localhost:${PORT}/`)
});
