const app = require("./src/app");

const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`App start with ${PORT}`);
});
