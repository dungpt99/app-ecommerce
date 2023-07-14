"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductFactoryService = require("../services/product.service");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new product success",
      metadata: await ProductFactoryService.createProduct(
        req.body.productType,
        {
          ...req.body,
          productShop: req.user.userId,
        }
      ),
    }).send(res);
  };
}

module.exports = new ProductController();
