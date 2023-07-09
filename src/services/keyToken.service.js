"use strict";

const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    try {
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey,
        privateKey,
      });

      return tokens ? tokens : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
