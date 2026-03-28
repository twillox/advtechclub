const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // Handle "Bearer <token>" format
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id, role from token
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
