"use strict";

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "Comments";

// Declare the Schema of the Mongo model
var commentSchema = new Schema(
  {
    commentProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    commentUserId: {
      type: Number,
      required: true,
      default: 1,
    },
    commentContent: {
      type: String,
      default: "text",
    },
    commentLeft: {
      type: Number,
      default: 0,
    },
    commentRight: {
      type: Number,
      default: 0,
    },
    commentParentId: {
      type: Schema.Types.ObjectId,
      ref: DOCUMENT_NAME,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = { comment: model(DOCUMENT_NAME, commentSchema) };
