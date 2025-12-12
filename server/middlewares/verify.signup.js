const db = require('../model')
const ROLES = db.ROLES
const User = db.user

checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        // Check for duplicate email
        user = await User.findOne({ email: req.body.email }).exec();
        if (user) {
            return res.status(403).send({ message: "Failed! Email is already in use!" });
        }

        // If neither username nor email is in use, proceed to the next middleware
        next();
    } catch (err) {
        // If an error occurs during the database query, send a 500 status response
        return res.status(500).send({ message: err });
    }
};

const verifySignUp = {
    checkDuplicateUsernameOrEmail,
};

module.exports = verifySignUp;
