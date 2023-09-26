"use strict";

const { BadRequestError } = require("../core/error.response");
const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "location",
  }) {
    const product = await getProductById(productId);
    if (!product) throw new BadRequestError("The product does not exists!");

    const query = {
      inventoryShopId: shopId,
      inventoryProductId: productId,
    };
    const updateSet = {
      $inc: {
        inventoryStock: stock,
      },
      $set: {
        inventoryLocation: location,
      },
    };
    const options = { upsert: true, new: true };
    return await inventory.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = InventoryService;
