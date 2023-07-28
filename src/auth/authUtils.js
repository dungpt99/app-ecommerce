"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotfoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "refresh-token",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    //

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];

  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserId(userId);

  if (!keyStore) throw new NotfoundError("Not found key store");

  const accessToken = req.headers[HEADER.AUTHORIZATION];

  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decode = JWT.verify(accessToken, keyStore.publicKey);

    if (userId !== decode.userId) throw new AuthFailureError("Invalid userId");

    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserId(userId);

  if (!keyStore) throw new NotfoundError("Not found key store");

  if (refreshToken) {
    try {
      const decode = JWT.verify(refreshToken, keyStore.privateKey);

      if (userId !== decode.userId)
        throw new AuthFailureError("Invalid userId");

      req.keyStore = keyStore;
      req.user = decode;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];

  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decode = JWT.verify(accessToken, keyStore.publicKey);

    if (userId !== decode.userId) throw new AuthFailureError("Invalid userId");

    req.user = decode;
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT,
};
