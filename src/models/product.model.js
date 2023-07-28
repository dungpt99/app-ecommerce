const { Schema, model, Types } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
var productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productThumb: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
    },
    productPrice: {
      type: Number,
      require: true,
    },
    productQuantity: {
      type: Number,
      require: true,
    },
    productType: {
      type: String,
      require: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    productShop: {
      type: Types.ObjectId,
      ref: "Shop",
    },
    productAttributes: {
      type: Schema.Types.Mixed,
      require: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Define the product type  = clothing
const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: String,
    material: String,
    productShop: {
      type: Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "Clothes",
    timestamps: true,
  }
);

//Define the product type  = electronic
const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
    productShop: {
      type: Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "Electronics",
    timestamps: true,
  }
);

//Define the product type  = furniture
const furnitureSchema = new Schema(
  {
    manufacturer: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
    productShop: {
      type: Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "Furniture",
    timestamps: true,
  }
);

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  electronic: model("Electronics", electronicSchema),
  clothing: model("Clothing", clothingSchema),
  furniture: model("Furniture", furnitureSchema),
};
