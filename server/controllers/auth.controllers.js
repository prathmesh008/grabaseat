const secret = process.env.JWT_SECRET;
const db = require("../model");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  console.log(req.body);
  try {
    const user = new User({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    await user.save();

    let roles = [];
    if (req.body.roles) {
      // Check if user is requesting admin role
      const requestedRoles = Array.isArray(req.body.roles) ? req.body.roles : [req.body.roles];

      if (requestedRoles.includes("admin")) {
        // Only allow admin if email is from vitbhopal.ac.in
        if (req.body.email.endsWith("@vitbhopal.ac.in")) {
          roles = await Role.find({ name: { $in: requestedRoles } });
        } else {
          // Return error if domain doesn't match for admin
          return res.status(400).send({ message: "Admin role requires @vitbhopal.ac.in email. Please select 'user' role." });
        }
      } else {
        roles = await Role.find({ name: { $in: requestedRoles } });
      }
    } else {
      const defaultRole = await Role.findOne({ name: "user" });
      roles.push(defaultRole);
    }

    user.roles = roles.map((role) => role._id);
    await user.save();

    res.send({ message: "User was registered successfully!" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).populate(
      "roles",
      "-__v"
    );

    if (!user) {
      return res.status(404).send({ message: "Email Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      secret,
      {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      }
    );

    const authorities = user.roles.map(
      (role) => "ROLE_" + role.name.toUpperCase()
    );

    res.status(200).send({
      // id: user._id,
      name: user.name,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
