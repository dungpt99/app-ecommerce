"user strict";

const { BadRequestError } = require("../core/error.response");
const { product, clothing, electronic } = require("../models/product.model");

class ProductFactoryService {
  static async createProduct(type, payload) {
    switch (type) {
      case "Electronics":
        return new Electronics(payload);
      case "Clothing":
        return new Clothing(payload).createProduct();
      default:
        throw new BadRequestError("Invalid product type");
    }
  }
}

class Product {
  constructor({
    productName,
    productThumb,
    productDescription,
    productPrice,
    productQuantity,
    productType,
    productShop,
    productAttributes,
  }) {
    this.productName = productName;
    this.productThumb = productThumb;
    this.productDescription = productDescription;
    this.productPrice = productPrice;
    this.productQuantity = productQuantity;
    this.productType = productType;
    this.productShop = productShop;
    this.productAttributes = productAttributes;
  }

  async createProduct(productId) {
    return await product.create({ ...this, _id: productId });
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.productAttributes,
      productShop: this.productShop,
    });
    if (!newClothing) throw new BadRequestError("Create clothing error");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create product error");

    return newProduct;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.productAttributes,
      productShop: this.productShop,
    });
    if (!newElectronic) throw new BadRequestError("Create electronic error");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create product error");

    return newProduct;
  }
}

module.exports = ProductFactoryService;
