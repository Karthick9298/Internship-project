const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: Verifies JWT from Authorization header.
 * Attaches req.user if valid.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized. No token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-passwordHash");

    if (!req.user) {
      return res.status(401).json({ message: "User not found." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized. Invalid token." });
  }
};

/**
 * Middleware: Optionally attaches user if token is provided.
 * Does NOT block unauthenticated requests.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-passwordHash");
    } catch {
      // Ignore invalid token in optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = { protect, optionalAuth };
