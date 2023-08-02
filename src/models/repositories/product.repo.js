"use strict";

const { Types } = require("mongoose");
const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../product.model");

const searchProduct = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();

  return results;
};

const findAllProductForShop = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("productShop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const publishProductByShop = async ({ productShop, productId }) => {
  const foundShop = await product.findOne({
    productShop: new Types.ObjectId(productShop),
    _id: new Types.ObjectId(productId),
  });
  if (!foundShop) return null;

  foundShop.isDraft = false;
  foundShop.isPublished = true;

  return await foundShop.save();
};

const unpublishProductByShop = async ({ productShop, productId }) => {
  const foundShop = await product.findOne({
    productShop: new Types.ObjectId(productShop),
    _id: new Types.ObjectId(productId),
  });
  if (!foundShop) return null;

  foundShop.isDraft = true;
  foundShop.isPublished = false;

  return await foundShop.save();
};

module.exports = {
  findAllProductForShop,
  publishProductByShop,
  unpublishProductByShop,
  searchProduct,
};
