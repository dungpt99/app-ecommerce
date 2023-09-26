"use strict";

const { cart } = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
const { NotfoundError } = require("../core/error.response");

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cartUserId: userId, cartState: "active" };
    const updateOrInsert = {
      $addToSet: {
        cartProducts: product,
      },
    };
    const options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
      cartUserId: userId,
      "cartProducts.productId": productId,
      cartState: "active",
    };
    const updateSet = {
      $inc: {
        "cartProducts.$.quantity": quantity,
      },
    };
    const options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  static async addToCart({ userId, product = {} }) {
    const userCart = await cart.findOne({ cartUserId: userId });

    if (!userCart) {
      return await CartService.createUserCart({ userId, product });
    }

    if (!userCart.cartProducts.length) {
      userCart.cartProducts = [product];
      userCart.cartCountProduct;
      return await userCart.save();
    }

    return await CartService.updateUserCartQuantity({ userId, product });
  }

  static async addToCartV2({ userId, shopOrderIds }) {
    const { productId, quantity, oldQuantity } = shopOrderIds?.itemProducts[0];

    const foundProduct = await getProductById(productId);

    if (!foundProduct) throw new NotfoundError("");

    if (foundProduct.productShop.toString() !== shopOrderIds?.shopId) {
      throw new NotfoundError("Product do not belong to the shop");
    }

    if (quantity === 0) {
      //delete
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: { productId, quantity: quantity - oldQuantity },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cartUserId: userId, cartState: "active" };
    const updateSet = {
      $pull: {
        cartProducts: {
          productId,
        },
      },
    };
    const deleteCart = await cart.updateOne(query, updateSet);

    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cart
      .findOne({
        cartUserId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
