"use strict";

const { model, Schema, Types } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    inventoryProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    inventoryLocation: {
      type: String,
      default: "unKnown",
    },
    inventoryStock: {
      type: Number,
      required: true,
    },
    inventoryShopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    inventoryReservations: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = { inventory: model(DOCUMENT_NAME, inventorySchema) };
