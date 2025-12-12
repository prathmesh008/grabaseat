// routes/admin.routes.js
const { authJwt } = require("../middlewares");
const controller = require("../controllers/admin.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Base Path: /api/admin
    app.get("/api/admin/analytics", [authJwt.verifyToken, authJwt.isAdmin], controller.getAnalytics);
    app.get("/api/admin/charts", [authJwt.verifyToken, authJwt.isAdmin], controller.getChartData);
    app.get("/api/admin/events", [authJwt.verifyToken, authJwt.isAdmin], controller.getAdminEvents);
    app.get("/api/admin/events/upcoming", [authJwt.verifyToken, authJwt.isAdmin], controller.getUpcomingEvents);
    app.get("/api/admin/registrations/recent", [authJwt.verifyToken, authJwt.isAdmin], controller.getRecentRegistrations);
};