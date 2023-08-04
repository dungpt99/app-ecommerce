"use strict";

const { inventory } = require("../inventory.model");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unknown",
}) => {
  return await inventory.create({
    inventoryProductId: productId,
    inventoryShopId: shopId,
    inventoryLocation: location,
    inventoryStock: stock,
  });
};

module.exports = {
  insertInventory,
};
