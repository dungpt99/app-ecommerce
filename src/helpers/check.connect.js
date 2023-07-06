"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const SECOND = 5000;
// count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  return numConnection;
};

// check overload
const checkOverLoad = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    const maxConnection = numCores * 5;

    console.log(`Active connection: ${numberConnection}`);
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);
    if (numConnection > maxConnection) {
      console.log("Connection overload detected!");
    }
  }, SECOND);
};

module.exports = {
  countConnect,
  checkOverLoad,
};
