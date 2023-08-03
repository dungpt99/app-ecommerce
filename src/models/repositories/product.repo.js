"use strict";

const { Types } = require("mongoose");
const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../product.model");
const { getSelectData, unGetSelectData } = require("../../utils");

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

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return products;
};

const findProduct = async ({ productId, unSelect }) => {
  return await product.findById(productId).select(unGetSelectData(unSelect));
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

const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, bodyUpdate, {
    new: isNew,
  });
};

module.exports = {
  findAllProductForShop,
  publishProductByShop,
  unpublishProductByShop,
  searchProduct,
  findAllProducts,
  findProduct,
  updateProductById,
};
