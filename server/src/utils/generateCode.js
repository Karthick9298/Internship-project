const { nanoid } = require("nanoid");
const File = require("../models/File");

/**
 * Generates a unique 6-character alphanumeric share code.
 * Retries until a unique one is found.
 */
const generateCode = async () => {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusing chars (0,O,1,I)
  let code;
  let exists = true;

  while (exists) {
    // Generate 6 random chars from our alphabet
    code = Array.from({ length: 6 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join("");

    exists = await File.findOne({ shareCode: code });
  }

  return code;
};

module.exports = generateCode;
