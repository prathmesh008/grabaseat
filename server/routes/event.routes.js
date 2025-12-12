const { authJwt } = require("../middlewares");
const controller = require("../controllers/event.controller");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    const uploadImages = upload.fields([
        { name: "poster", maxCount: 1 },
        { name: "banner", maxCount: 1 }
    ]);

    app.post("/api/events", [authJwt.verifyToken, uploadImages], controller.createEvent);
    app.get("/api/events", controller.getAllEvents);
    app.get("/api/events/banners", controller.getEventBanners);
    app.get("/api/events/:id", controller.getEventById);
    app.get("/api/events/:id/poster", controller.getEventPoster);
    app.get("/api/events/:id/banner", controller.getEventBanner); // New Banner Endpoint
    app.delete("/api/events/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteEvent);
};
