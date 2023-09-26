"use strict";

const { convertToObjectIdMongodb } = require("../../utils");
const { inventory } = require("../inventory.model");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unknown",
}) => {
  return await inventory.create({
    inventoryProductId: productId,
    inventoryStock: stock,
    inventoryLocation: location,
    inventoryShopId: shopId,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inventoryProductId: convertToObjectIdMongodb(productId),
    inventoryStock: { $gte: quantity },
  };
  const updateSet = {
    $inc: {
      inventoryStock: -quantity,
    },
    $push: {
      inventoryReservations: {
        quantity,
        cartId,
        createdOn: new Date(),
      },
    },
  };
  const options = {
    upsert: true,
    new: true,
  };

  return await inventory.updateOne(query, updateSet);
};

module.exports = {
  insertInventory,
  reservationInventory,
};
