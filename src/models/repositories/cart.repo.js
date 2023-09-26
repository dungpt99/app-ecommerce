"use strict";

const { convertToObjectIdMongodb } = require("../../utils/index");
const { cart } = require("../cart.model");

const findCartById = async (cartId) => {
  return await cart
    .findOne({ _id: convertToObjectIdMongodb(cartId), cartState: "active" })
    .lean();
};

module.exports = {
  findCartById,
};
