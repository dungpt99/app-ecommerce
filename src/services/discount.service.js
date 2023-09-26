"use strict";

const { BadRequestError, NotfoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodesUnSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      startDate,
      endDate,
      isActive,
      shopId,
      minOrderValue,
      productIds,
      appliesTo,
      name,
      description,
      type,
      value,
      maxUses,
      usesCount,
      usersUsed,
      maxUsePerUser,
    } = payload;
    if (
      new Date(endDate) < new Date(startDate) ||
      new Date() > new Date(endDate)
    ) {
      throw new BadRequestError("Discount code has expired");
    }

    const foundDiscount = await discountModel
      .findOne({
        discountCode: code,
        discountShopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discountIsActive) {
      throw new BadRequestError("Discount exist!");
    }

    const newDiscount = await discountModel.create({
      discountName: name,
      discountDescription: description,
      discountType: type,
      discountValue: value,
      discountCode: code,
      discountStart: new Date(startDate),
      discountEnd: new Date(endDate),
      discountMaxUses: maxUses,
      discountUsed: usesCount,
      discountUsersUsed: usersUsed,
      discountMaxUserCanUse: maxUsePerUser,
      discountMinOrderValue: minOrderValue,
      discountShopId: shopId,
      discountIsActive: isActive,
      discountApplyTo: appliesTo,
      discountProductIds: appliesTo === "all" ? [] : productIds,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {}

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    const foundDiscount = await discountModel
      .findOne({
        discountCode: code,
        discountShopId: convertToObjectIdMongodb(shopId),
      })
      .lean();
    if (!foundDiscount || !foundDiscount.discountIsActive) {
      throw new NotfoundError("Discount not exist");
    }

    const { discountApplyTo, discountProductIds } = foundDiscount;

    let products;

    if (discountApplyTo === "all") {
      products = await findAllProducts({
        filter: {
          productShop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["productName"],
      });
    }

    if (discountApplyTo === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discountProductIds },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["productName"],
      });
    }

    return products;
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discountShopId: convertToObjectIdMongodb(shopId),
        discountIsActive: true,
      },
      unSelect: ["__v", "discountShopId"],
      model: discountModel,
    });

    return discounts;
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discountCode: codeId,
        discountShopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotfoundError("Discount not found");

    const {
      discountIsActive,
      discountMaxUses,
      discountStart,
      discountEnd,
      discountMinOrderValue,
      discountMaxUserCanUse,
      discountUsersUsed,
      discountValue,
      discountType,
    } = foundDiscount;

    if (!discountIsActive) throw new NotfoundError("Discount expired");
    if (!discountMaxUses) throw new NotfoundError("Discount is out");

    if (
      new Date() < new Date(discountStart) ||
      new Date() > new Date(discountEnd)
    ) {
      throw new NotfoundError("Discount expired");
    }

    // check gia tri toi thieu
    let totalOrder = 0;
    if (discountMinOrderValue > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discountMinOrderValue)
        throw new NotfoundError(
          `Discount require a minium order value of ${discountMinOrderValue}`
        );
    }

    if (discountMaxUserCanUse > 0) {
      const userDiscount = discountUsersUsed.find(
        (user) => user.userId === userId
      );

      if (userDiscount) {
      }
    }

    // check discount nay la fix amount
    const amount =
      discountType === "fixed_amount"
        ? discountValue
        : totalOrder * (discountValue / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discountCode: codeId,
      discountShopId: convertToObjectIdMongodb(shopId),
    });
    return deleted;
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discountCode: codeId,
        discountShopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotfoundError("Discount not found");

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discountUsersUsed: userId,
      },
      $inc: {
        discountMaxUses: 1,
        discountUsed: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
