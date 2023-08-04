"use strict";

const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { insertInventory } = require("../models/repositories/inventory.repo");
const {
  findAllProductForShop,
  publishProductByShop,
  unpublishProductByShop,
  searchProduct,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");

class ProductFactoryService {
  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactoryService.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactoryService.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid Product types ${type}`);
    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactoryService.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid Product Types ${type}`);

    return new productClass(payload).updateProduct(productId);
  }

  static async publishProductByShop({ productShop, productId }) {
    return await publishProductByShop({ productShop, productId });
  }

  static async unpublishProductByShop({ productShop, productId }) {
    return await unpublishProductByShop({ productShop, productId });
  }

  static async findAllDraftForShop({ productShop, limit = 50, skip = 0 }) {
    const query = { productShop, isDraft: true };
    return await findAllProductForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ productShop, limit = 50, skip = 0 }) {
    const query = { productShop, isPublished: true };
    return await findAllProductForShop({ query, limit, skip });
  }

  static async searchProduct({ keySearch }) {
    return await searchProduct({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      filter,
      page,
      select: ["productName", "productPrice", "productThumb"],
    });
  }

  static async findProduct({ productId }) {
    return await findProduct({ productId, unSelect: ["__v"] });
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
    const newProduct = await product.create({ ...this, _id: productId });
    if (newProduct) {
      await insertInventory({
        productId: newProduct._id,
        shopId: this.productShop,
        stock: this.productQuantity,
      });
    }
    return newProduct;
  }

  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({
      productId,
      bodyUpdate,
      model: product,
    });
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

  async updateProduct(productId) {
    // 1. remove attr has null and undefined
    const objectParams = removeUndefinedObject(this);
    if (objectParams.productAttributes) {
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.productAttributes),
        model: clothing,
      });
    }
    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    );
    return updateProduct;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.productAttributes,
      productShop: this.productShop,
    });
    if (!newElectronic) throw new BadRequestError("Create newElectronic error");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create product error");

    return newProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.productAttributes,
      productShop: this.productShop,
    });
    if (!newFurniture) throw new BadRequestError("Create newFurniture error");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create product error");

    return newProduct;
  }
}

ProductFactoryService.registerProductType("Electronics", Electronics);
ProductFactoryService.registerProductType("Clothing", Clothing);
ProductFactoryService.registerProductType("Furniture", Furniture);

module.exports = ProductFactoryService;
