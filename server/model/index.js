const moongose = require('mongoose')
moongose.Promise = global.Promise;

const db = {};
db.user = require("./user.model");
db.role = require("./role.model");
db.event = require("./clubData.model");
db.booking = require("./booking.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
