"use strict";

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
  {
    discountName: {
      type: String,
      required: true,
    },
    discountDescription: {
      type: String,
      required: true,
    },
    // percentage
    discountType: {
      type: String,
      default: "fixed_amount",
    },
    discountValue: {
      type: Number,
      required: true,
    },
    discountCode: {
      type: String,
      required: true,
    },
    discountStart: {
      type: Date,
      required: true,
    },
    discountEnd: {
      type: Date,
      required: true,
    },
    // So luong duoc ap dung
    discountMaxUses: {
      type: Number,
      required: true,
    },
    // So luong da dung
    discountUsed: {
      type: Number,
      required: true,
    },
    // Ai da dung
    discountUsersUsed: {
      type: Array,
      default: [],
    },
    // So luong toi da duoc su dung
    discountMaxUserCanUse: {
      type: Number,
      required: true,
    },
    discountMinOrderValue: {
      type: Number,
      required: true,
    },
    discountShopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    discountIsActive: {
      type: Boolean,
      default: true,
    },
    discountApplyTo: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    // So san pham duoc ap dung
    discountProductIds: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
