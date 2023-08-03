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

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product success",
      metadata: await ProductFactoryService.updateProduct(
        req.body.productType,
        req.params.productId,
        { ...req.body, productShop: req.user.userId }
      ),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product success",
      metadata: await ProductFactoryService.publishProductByShop({
        productShop: req.user.userId,
        productId: req.params.id,
      }),
    }).send(res);
  };

  unpublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product success",
      metadata: await ProductFactoryService.unpublishProductByShop({
        productShop: req.user.userId,
        productId: req.params.id,
      }),
    }).send(res);
  };

  /**
   * @description Get all draft for shop
   * @param { Number } limit
   * @param { Number } skip
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

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list publish product success",
      metadata: await ProductFactoryService.findAllPublishForShop({
        productShop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list product success",
      metadata: await ProductFactoryService.searchProduct(req.params),
    }).send(res);
  };

  getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list product success",
      metadata: await ProductFactoryService.findAllProducts(req.query),
    }).send(res);
  };

  getProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list product success",
      metadata: await ProductFactoryService.findProduct({
        productId: req.params.id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
