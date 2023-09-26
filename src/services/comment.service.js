"use strict";

const { NotfoundError } = require("../core/error.response");
const { comment } = require("../models/comment.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findProduct } = require("../models/repositories/product.repo");

/*
    key features: comment service
    + add comment [User, shop]
    + get a list of comments [User, shop]
    + delete a comment [User | Shop | Admin]
*/
class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const newComment = new comment({
      commentProductId: productId,
      commentUserId: userId,
      commentContent: content,
      commentParentId: parentCommentId,
    });

    let rightValue;
    if (parentCommentId) {
      const parentComment = await comment.findById(parentCommentId);
      if (!parentComment) throw new NotfoundError("Not found parent comment");

      rightValue = parentComment.commentRight;

      // Update many
      await comment.updateMany(
        {
          commentProductId: convertToObjectIdMongodb(productId),
          commentRight: { $gte: rightValue },
        },
        { $inc: { commentRight: 2 } }
      );

      await comment.updateMany(
        {
          commentProductId: convertToObjectIdMongodb(productId),
          commentLeft: { $gte: rightValue },
        },
        { $inc: { commentLeft: 2 } }
      );
    } else {
      const maxRightValue = await comment.findOne(
        {
          commentProductId: convertToObjectIdMongodb(productId),
        },
        "commonRight",
        { sort: { commentRight: -1 } }
      );

      if (maxRightValue) {
        rightValue = maxRightValue.commentRight + 1;
      } else {
        rightValue = 1;
      }
    }

    newComment.commentLeft = rightValue;
    newComment.commentRight = rightValue + 1;

    await newComment.save();

    return newComment;
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId,
    limit = 50,
    offset = 0,
  }) {
    if (parentCommentId) {
      const parent = await comment.findById(parentCommentId);

      if (!parent) throw new NotfoundError("Not found comment");

      const comments = comment
        .find({
          commentProductId: convertToObjectIdMongodb(productId),
          commentLeft: { $gt: parent.commentLeft },
          commentRight: { $lte: parent.commentRight },
        })
        .select({
          commentLeft: 1,
          commentRight: 1,
          commentContent: 1,
          commentParentId: 1,
        })
        .sort({
          commentLeft: 1,
        });

      return comments;
    }

    const comments = comment
      .find({
        commentProductId: convertToObjectIdMongodb(productId),
        commentParentId: parentCommentId,
      })
      .select({
        commentLeft: 1,
        commentRight: 1,
        commentContent: 1,
        commentParentId: 1,
      })
      .sort({
        commentLeft: 1,
      });

    return comments;
  }

  static async deleteComments({ commentId, productId }) {
    // Check the product exists in db
    const foundProduct = await findProduct({
      productId: productId,
    });
    if (!foundProduct) throw new NotfoundError("Product not found");

    const foundComment = await comment.findById(commentId);
    if (!foundComment) throw new NotfoundError("Comment not found");

    const leftValue = foundComment.commentLeft;
    const rightValue = foundComment.commentRight;

    const width = rightValue - leftValue + 1;

    await comment.deleteMany({
      commentProductId: convertToObjectIdMongodb(productId),
      commentLeft: { $gte: leftValue, $lte: rightValue },
    });

    await comment.updateMany(
      {
        commentProductId: convertToObjectIdMongodb(productId),
        commentRight: { $gt: rightValue },
      },
      {
        $inc: {
          commentRight: -width,
        },
      }
    );

    await comment.updateMany(
      {
        commentProductId: convertToObjectIdMongodb(productId),
        commentLeft: { $gt: rightValue },
      },
      {
        $inc: {
          commentLeft: -width,
        },
      }
    );

    return true;
  }
}

module.exports = CommentService;
