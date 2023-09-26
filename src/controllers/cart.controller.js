"use strict";

const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  /**
   * @Desc add to cart for user
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.addToCart({
        ...req.body,
      }),
    }).send(res);
  };

  updateToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.addToCartV2({
        ...req.body,
      }),
    }).send(res);
  };

  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.deleteUserCart({
        ...req.body,
      }),
    }).send(res);
  };

  listToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.getListUserCart({
        ...req.query,
      }),
    }).send(res);
  };
}

module.exports = new CartController();
