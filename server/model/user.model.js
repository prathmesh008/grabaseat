const moongose = require("mongoose");

const userSchema = new moongose.Schema({
  name: {
    type: String,
  },
  phoneNumber: {
    type:String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  roles: [
    {
      type: moongose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
});

const User = moongose.model("User", userSchema);

module.exports = User;
