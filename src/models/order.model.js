"use strict";

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

// Declare the Schema of the Mongo model
var orderSchema = new Schema(
  {
    orderUserId: {
      type: Number,
      required: true,
    },
    orderCheckout: {
      type: Object,
      default: {},
    },
    /**
     * orderCheckout = {
     *      totalPrice,
     *      totalApplyDiscount,
     *      feeShip
     * }
     */
    orderShipping: {
      type: Object,
      default: {},
    },
    /**
     * street,
     * city,
     * state,
     * country
     */
    orderPayment: {
      type: Object,
      default: {},
    },
    orderProducts: {
      type: Array,
      required: true,
    },
    orderTrackingNumber: {
      type: String,
      default: "#0001",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "cancel", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = { order: model(DOCUMENT_NAME, orderSchema) };
