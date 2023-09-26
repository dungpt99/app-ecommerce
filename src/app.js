const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const app = express();

//init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
// app.use(morgan("combined"));
// app.use(morgan("common"));
// app.use(morgan("short"));
// app.use(morgan("tiny"));

// Test pubsub redis
// require("../src/tests/inventory.test");
// const productTest = require("../src/tests/product.test");
// productTest.purchaseProduct("123", 10);

//init db
require("./dbs/init.mongodb");

// init router
app.use("", require("./routes"));

// handling error

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
