const crypto = require("crypto");

const generateOtp = () => {
  return crypto.randomInt(0, 1000000)
    .toString()
    .padStart(6, "0");
};

module.exports = generateOtp;