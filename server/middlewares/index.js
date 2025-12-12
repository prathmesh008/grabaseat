// This file only combines the verify.signup.js and auth.jwt.js Files

const authJwt = require("./auth.jwt");
const verifySignUp = require("./verify.signup");

module.exports = {
  authJwt,
  verifySignUp
};