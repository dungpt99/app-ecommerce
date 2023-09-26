"use strict";

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

// ORDER-001: order success
// ORDER-002: order failed
// PROMOTION-001: new promotion
// SHOP-001: new product by user following

// Declare the Schema of the Mongo model
var notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: [" ORDER-001", "ORDER-002", "PROMOTION-001", "SHOP-001"],
      require: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    receivedId: {
      type: Number,
      require: true,
    },
    content: {
      type: String,
      require: true,
    },
    options: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = { notification: model(DOCUMENT_NAME, notificationSchema) };
