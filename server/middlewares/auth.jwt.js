const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const db = require("../model");
const User = db.user;
const Role = db.role;

// Middleware 1: It Verifies The Token
verifyToken = (req, res, next) => {
  // console.log(req)
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

// Middleware 2: It checks weather the user is admin or not
isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const roles = await Role.find({ _id: { $in: user.roles } }).exec();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        return next();
      }
    }

    return res.status(403).send({ message: "Require Admin Role!" });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
};
module.exports = authJwt;
