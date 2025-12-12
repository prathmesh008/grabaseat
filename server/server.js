const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: __dirname + '/.env' }); // Load environment variables explicitly
const mongoose = require("mongoose");
const db = require("./model");
const Role = db.role;
const Event = require("./model/clubData.model");
const userEvent = require("./model/userEventRegistrationData.model")
const multer = require("multer");
const { authJwt } = require("./middlewares");

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);


const { MongoMemoryServer } = require("mongodb-memory-server");

async function seedEvents() {
    const fs = require('fs');
    const path = require('path');

    try {
        const assetsDir = path.join(__dirname, '../app/(protected)/_assets');

        if (!fs.existsSync(assetsDir)) {
            console.warn("Assets directory not found:", assetsDir);
            return;
        }

        const files = fs.readdirSync(assetsDir).filter(file => file.match(/\.(jpeg|jpg|png)$/i));
        const eventCount = await Event.countDocuments();

        // If we have fewer events than files, assume we need to re-seed (or if forced reset)
        // For this dev session, let's force reset to ensure all images are loaded correctly.
        // Only seed if the database is empty to prevent overwriting new events
        if (eventCount === 0) {
            console.log(`Seeding events from ${assetsDir}...`);

            const eventsToInsert = [];
            const today = new Date();
            const categories = ["Concert", "Workshop", "Cultural", "Tech", "Competition"];

            files.forEach((file, index) => {
                const title = file.replace(/\.[^/.]+$/, "").replace(/([A-Z])/g, ' $1').trim(); // "RockABlast.jpeg" -> "Rock A Blast"
                const filePath = path.join(assetsDir, file);
                const imageBuffer = fs.readFileSync(filePath);

                // Distribute dates: 1 event every 3 days starting next week
                const eventDate = new Date(today);
                eventDate.setDate(today.getDate() + 7 + (index * 3));

                // Random time
                const hour = 10 + (index % 12); // 10 AM to 10 PM
                const time = `${hour}:00`;

                eventsToInsert.push({
                    title: title,
                    description: `Experience the thrill of ${title}. Join us for an unforgettable event!`,
                    category: categories[index % categories.length],
                    date: eventDate,
                    time: time,
                    location: index % 2 === 0 ? "Main Auditorium" : "Open Air Theatre",
                    poster: {
                        data: imageBuffer,
                        contentType: 'image/jpeg'
                    },
                    banner: { // Use same image for banner for simplicity
                        data: imageBuffer,
                        contentType: 'image/jpeg'
                    },
                    sections: [
                        { name: "Gold", price: 500 + (index * 50), rows: 5, cols: 10 },
                        { name: "Silver", price: 200 + (index * 20), rows: 8, cols: 15 }
                    ],
                    basePrice: 200 + (index * 20),
                    status: "UPCOMING"
                });
            });

            await Event.insertMany(eventsToInsert);
            console.log(`Successfully seeded ${eventsToInsert.length} events from assets.`);
        } else {
            console.log("Events already exist. Skipping seed to preserve data.");
        }
    } catch (error) {
        console.error("Error seeding events:", error);
    }
}

const bcrypt = require("bcryptjs");
const User = db.user; // Ensure this is available in scope or require it

async function initial() {
    try {
        const count = await Role.estimatedDocumentCount();
        if (count === 0) {
            await Promise.all([
                new Role({ name: "user" }).save(),
                new Role({ name: "admin" }).save(),
            ]);
            console.log("Roles added successfully.");
        }

        // Seed Default User (AI Tester)
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const userRole = await Role.findOne({ name: "user" });
            const defaultUser = new User({
                name: "AI Tester",
                email: "ai@test.com",
                password: bcrypt.hashSync("Password123!", 8),
                roles: [userRole._id]
            });
            await defaultUser.save();
            console.log("Default User (ai@test.com) seeded successfully.");
        }

    } catch (err) {
        console.error("Error initializing roles/users:", err);
    }
}

async function startServer() {
    let mongoUri = process.env.MONGODB_URI;

    // Try connecting to the provided URI or fallback to Memory Server
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(mongoUri || "mongodb://127.0.0.1:27017/EventBooking", {
            serverSelectionTimeoutMS: 5000 // Fail fast if remote is down
        });
        console.log("MongoDB Connected Successfully (Remote/Local).");
    } catch (err) {
        console.warn("Remote/Local MongoDB connection failed. Starting In-Memory Database...", err.message);
        try {
            const mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
            await mongoose.connect(mongoUri);
            console.log("Connected to In-Memory MongoDB at:", mongoUri);
        } catch (memErr) {
            console.error("Failed to start In-Memory Database:", memErr);
            process.exit(1);
        }
    }

    // Initialize Roles and Seed Data
    await initial();
    await seedEvents();
}

startServer();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"], // Allow frontend ports
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io accessible globally in the app
app.set("io", io);

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join_event", (eventId) => {
        socket.join(eventId);
        console.log(`User ${socket.id} joined event room: ${eventId}`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/event.routes")(app);
require("./routes/booking.routes")(app);
require("./routes/payment.routes")(app);
require("./routes/admin.routes")(app); // Added Admin Routes

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
    console.log(`Server is running on port ${PORT}...`);
    console.log("Environment configuration updated v3 - Seeding Assets.");
});
