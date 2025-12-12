const moongose = require("mongoose");

const userEventSchema = new moongose.Schema({
  name: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  regno: {
    type: String
  },
  eventName: {
    type: String
  },
  seatNumber: {
    type: String
  }
});

const UserEvents = moongose.model("UserEvents", userEventSchema);

module.exports = UserEvents;
