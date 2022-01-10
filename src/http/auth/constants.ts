import * as functions from "firebase-functions";

export const jwtConstants = {
  secret: process.env.JWT_SECRET || functions.config().JWT_SECRET,
  expiresTime: "30d",
};
