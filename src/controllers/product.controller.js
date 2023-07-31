"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductFactoryService = require("../services/product.service.xxx");

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

  /**
   * @description Get all draft for shop
   * @param {Number } limit
   * @param {Number } skip
   * @return { JSON }
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list draft product success",
      metadata: await ProductFactoryService.findAllDraftForShop({
        productShop: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
