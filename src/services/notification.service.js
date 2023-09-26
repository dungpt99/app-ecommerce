"use strict";

const { notification } = require("../models/notification.model");

const pushNotificationToSystem = async ({
  type = "SHOP-001",
  receivedId = 1,
  senderId = 1,
  options = {},
}) => {
  let content;

  if (type === "SHOP-001") {
    content = `@@@ add new product: @@@`;
  } else if (type === "PROMOTION-001") {
    content = `@@@ add new voucher: @@@`;
  }

  const newNotification = await notification.create({
    type,
    content,
    senderId,
    receivedId,
    options,
  });

  return newNotification;
};

const listNotificationByUser = async ({
  userId = 1,
  type = "ALL",
  isRead = 0,
}) => {
  const match = { receivedId: userId };
  if (type !== "ALL") {
    match["type"] = type;
  }
  return await notification.aggregate([
    {
      $match: match,
    },
    {
      $project: {
        type: 1,
        senderId: 1,
        receivedId: 1,
        content: {
          $concat: [
            {
              $substr: ["$options.shopName", 0, -1],
            },
            " add new product: ",
            {
              $substr: ["$options.productName", 0, -1],
            },
          ],
        },
        options: 1,
        createAt: 1,
      },
    },
  ]);
};

module.exports = {
  pushNotificationToSystem,
  listNotificationByUser,
};
