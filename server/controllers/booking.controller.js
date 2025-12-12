const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const db = require("../model");
const { verifyPaymentSignature } = require("./payment.controller");
const Booking = db.booking;
const Event = db.event;
const User = db.user;

exports.bookTickets = async (req, res) => {
    try {
        const { eventId, tickets, paymentDetails } = req.body; // paymentDetails: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        const userId = req.userId;
        // const { getDynamicPricing } = require("../services/pricing.service");

        // --- Payment Verification ---
        if (paymentDetails && paymentDetails.razorpay_payment_id && paymentDetails.razorpay_signature) {
            console.log("Verifying Payment:", paymentDetails.razorpay_payment_id);
            const isValid = verifyPaymentSignature(
                paymentDetails.razorpay_order_id,
                paymentDetails.razorpay_payment_id,
                paymentDetails.razorpay_signature
            );
            if (!isValid) {
                console.error("Payment Signature Verification Failed!");
                return res.status(400).send({ message: "Payment verification failed. Booking rejected." });
            }
        } else if (paymentDetails) {
            console.warn("Incomplete payment details received:", paymentDetails);
            // Optionally reject or allow as fallback depending on strictness. 
            // For now, let's treat it as failure if details are malformed but present.
            return res.status(400).send({ message: "Incomplete payment details." });
        } else {
            console.log("Warning: Booking processed without payment details (Dev Mode)");
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).send({ message: "Event not found" });

        // Add Expiry Check
        const currentTime = new Date();
        const eventDateTime = new Date(event.date);

        // If event holds time separately (e.g., "18:00"), merge it
        if (event.time && event.time.includes(':')) {
            const [hours, minutes] = event.time.split(':').map(Number);
            eventDateTime.setHours(hours, minutes, 0, 0);
        } else {
            // Default to end of day if only date is known? Or keep as is.
            // Let's assume date object usually holds 00:00:00 if constructed from date string without time
            // So setting hours is important if we want precision
        }

        if (currentTime > eventDateTime || ["COMPLETED", "CANCELLED"].includes(event.status)) {
            return res.status(400).send({ message: "Booking closed: Event has ended or is cancelled." });
        }

        // Backfill basePrice for legacy events if missing
        if (event.basePrice === undefined || event.basePrice === null) {
            event.basePrice = 0;
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).send({ message: "User not found" });

        // --- FETCH DYNAMIC PRICING (DISABLED) ---
        // const pricingData = await getDynamicPricing(event);
        // const dynamicMultiplier = pricingData.multiplier;
        // console.log(`Applying Dynamic Multiplier: ${dynamicMultiplier}x`);
        const dynamicMultiplier = 1; // Default to 1 (No Dynamic Pricing)

        let totalAmount = 0;
        const bookedTickets = [];
        const seatNumbers = [];

        // Process each ticket
        for (const ticket of tickets) {
            const section = event.sections.id(ticket.sectionId);
            if (!section) return res.status(400).send({ message: "Invalid section" });

            if (section.bookedSeats.includes(ticket.seatNumber)) {
                return res.status(400).send({ message: `Seat ${ticket.seatNumber} is already booked` });
            }

            section.bookedSeats.push(ticket.seatNumber);

            // Calculate price (Standard)
            const finalPrice = section.price;

            totalAmount += finalPrice;
            bookedTickets.push({
                sectionId: section._id,
                sectionName: section.name,
                seatNumber: ticket.seatNumber,
                price: finalPrice
            });
            seatNumbers.push(ticket.seatNumber);
        }

        // Update Aggregate Booked Count
        event.soldCount = (event.soldCount || 0) + tickets.length;

        await event.save();

        // Create Booking
        const bookingData = {
            user: userId,
            event: eventId,
            tickets: bookedTickets,
            totalAmount,
            dynamicMultiplier // Lock the multiplier in history
        };

        if (paymentDetails && paymentDetails.razorpay_payment_id) {
            bookingData.paymentId = paymentDetails.razorpay_payment_id;
        }

        const booking = new Booking(bookingData);

        await booking.save();

        // --- 1. Real-Time Update (Socket.io) ---
        const io = req.app.get('io');
        if (io) {
            // Emit to Event Room (for Seat Maps)
            io.to(eventId).emit('seats_updated', {
                eventId,
                bookedTickets
            });

            // Emit Global Update for Admin Dashboard
            io.emit('dashboard_update', {
                type: 'NEW_BOOKING',
                eventId,
                amount: totalAmount
            });
            console.log("Socket events emitted: seats_updated & dashboard_update");
        }

        // --- 2. QR Code Generation ---
        const qrData = JSON.stringify({
            bookingId: booking._id,
            event: event.title,
            seats: seatNumbers,
            user: user.name
        });

        let qrCodeUrl = "";
        try {
            qrCodeUrl = await QRCode.toDataURL(qrData);
            booking.qrCode = qrCodeUrl;
            await booking.save();
        } catch (err) {
            console.error("QR Generation Error:", err);
        }

        // --- 3. Email Notification ---
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `Booking Confirmed: ${event.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h1 style="color: #008080;">Booking Confirmed!</h1>
                        <p>Hi ${user.name},</p>
                        <p>Your tickets for <strong>${event.title}</strong> have been successfully booked.</p>
                        <p><strong>Seats:</strong> ${seatNumbers.join(", ")}</p>
                        <p><strong>Multiplier Applied:</strong> ${dynamicMultiplier}x (Dynamic Pricing)</p>
                        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
                        <br/>
                        <p>Please show the attached QR code at the entry.</p>
                    </div>
                `,
                attachments: [
                    {
                        filename: 'ticket_qr.png',
                        content: qrCodeUrl.split("base64,")[1],
                        encoding: 'base64'
                    }
                ]
            };

            transporter.sendMail(mailOptions).catch(err => console.error("Email Send Error:", err));
        } else {
            console.log("Skipping email: EMAIL_USER/PASS not set in .env");
        }

        res.status(201).send({
            message: "Booking successful",
            booking,
            qrCode: qrCodeUrl
        });

    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).send({ message: "Error processing booking: " + error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.userId }).populate("event");
        res.status(200).send(bookings);
    } catch (error) {
        res.status(500).send({ message: "Error fetching bookings" });
    }
};
