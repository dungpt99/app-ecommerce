"use strict";

const apikeyModel = require("../models/apikey.model");
const crypto = require("crypto");
const findById = async (key) => {
  try {
    // const newKey = await apikeyModel.create({
    //   key: crypto.randomBytes(64).toString("hex"),
    //   permissions: ["0000"],
    //   status: true,
    // });
    // console.log(newKey);
    const objKey = await apikeyModel.findOne({ key, status: true }).lean();
    return objKey;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { findById };
