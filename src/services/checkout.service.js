"use strict";

const { BadRequestError } = require("../core/error.response");
const { order } = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  static async checkoutReview({ cartId, userId, shopOrderIds }) {
    const foundCart = await findCartById(cartId);

    if (!foundCart) throw new BadRequestError("Cart does not exists");

    const checkoutOder = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0,
    };

    const shopOrderIdsNew = [];

    for (let i = 0; i < shopOrderIds.length; i++) {
      const { shopId, shopDiscounts = [], itemProducts = [] } = shopOrderIds[i];

      const checkProductServer = await checkProductByServer(itemProducts);

      if (!checkProductServer[0]) throw new BadRequestError("Order wrong");

      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      checkoutOder.totalPrice = +checkoutPrice;

      const itemCheckout = {
        shopId,
        shopDiscounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        itemProducts: checkProductServer,
      };

      if (shopDiscounts.length) {
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shopDiscounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });

        checkoutOder.totalDiscount += discount;

        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      checkoutOder.totalCheckout += itemCheckout.priceApplyDiscount;
      shopOrderIdsNew.push(itemCheckout);
    }

    return {
      shopOrderIds,
      shopOrderIdsNew,
      checkoutOder,
    };
  }

  static async orderByUser({
    shopOrderIds,
    cartId,
    userId,
    userAddress = {},
    userPayment = {},
  }) {
    const { shopOrderIdsNew, checkoutOder } = await this.checkoutReview({
      cartId,
      userId,
      shopOrderIds: shopOrderIds,
    });

    // Check again
    // Get new array products
    const products = shopOrderIdsNew.flatMap((order) => order.itemProducts);
    console.log(products);
    const acquireProduct = [];

    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    // Check inventory
    if (acquireProduct.includes(false)) {
      throw new BadRequestError("Product is updated");
    }

    const newOrder = await order.create({
      orderUserId: userId,
      orderCheckout: checkoutOder,
      orderShipping: userAddress,
      orderPayment: userPayment,
      orderProducts: shopOrderIdsNew,
    });

    if (newOrder) {
      // Remove product in cart
    }

    return newOrder;
  }

  static async getOrdersByUser() {}

  static async getOneOrderByUser() {}

  static async cancelOrderByUser() {}

  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
