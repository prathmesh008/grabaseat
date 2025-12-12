const { authJwt } = require("../middlewares");
const controller = require("../controllers/booking.controller");

module.exports = function (app) {
    console.log("Loading Booking Routes...");
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/bookings", [authJwt.verifyToken], controller.bookTickets);
    app.get("/api/bookings", [authJwt.verifyToken], controller.getUserBookings);
};
