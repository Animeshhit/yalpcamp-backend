const jwt = require("jsonwebtoken");
const dontenv = require("dotenv");

dontenv.config();

const secretKey = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  const token = req.query.api_key;

  if (!token) {
    return res.status(401).json({ message: "You Are Not Authenticated" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "You Are Not Authenticated" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = { authenticateToken };
