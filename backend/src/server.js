const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server running on port 3000");
  console.log("Open UI from here: http://localhost:3000/")
});
