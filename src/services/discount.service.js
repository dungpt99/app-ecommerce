"use strict";

const { BadRequestError, NotfoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodesUnSelect,
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
    if (new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
      throw new BadRequestError("Discount code has expired");
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestError("Start date must be before end date");
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

    const newDiscount = await discount.create({
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
    if (!foundDiscount || !foundDiscount.isActive) {
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
}
