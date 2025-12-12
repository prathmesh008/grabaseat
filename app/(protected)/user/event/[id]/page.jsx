'use client'
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import authHeader from '@/services/authHeader';
import Header from '@/app/(protected)/_components/header';
import Image from 'next/image';
import { Button } from '@nextui-org/react';
import { toast } from 'sonner';
import { io } from "socket.io-client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

// Hardcoded API URL to ensure reliability
const API_URL = "http://localhost:8000/api";

const EventDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    // New State for Real-Time & QR
    const [socket, setSocket] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    // Check if event has ended - Defined early to avoid Rule of Hooks violation
    const isEventEnded = React.useMemo(() => {
        if (!event) return false;
        const now = new Date();
        const eventDate = new Date(event.date);
        if (event.time && event.time.includes(':')) {
            const [hours, minutes] = event.time.split(':').map(Number);
            eventDate.setHours(hours, minutes, 0, 0);
        }
        return now > eventDate || event.status === 'COMPLETED' || event.status === 'CANCELLED';
    }, [event]);

    // Helper for safe buffer conversion to Blob URL (Faster & Safer than Base64)
    const bufferToUrl = (buffer, contentType = 'image/jpeg') => {
        if (!buffer) return null;
        try {
            let bytes;
            // Handle MongoDB Buffer object { type: 'Buffer', data: [...] }
            if (buffer && buffer.type === 'Buffer' && Array.isArray(buffer.data)) {
                bytes = new Uint8Array(buffer.data);
            }
            // Handle raw array
            else if (Array.isArray(buffer)) {
                bytes = new Uint8Array(buffer);
            }
            else {
                return null;
            }

            const blob = new Blob([bytes], { type: contentType });
            return URL.createObjectURL(blob);
        } catch (e) {
            console.error("Error creating object URL:", e);
            return null;
        }
    };

    // Socket.io Connection
    useEffect(() => {
        const newSocket = io("http://localhost:8000"); // Ensure this matches your server port
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to socket server");
            if (id) newSocket.emit("join_event", id);
        });

        newSocket.on("seats_updated", (data) => {
            if (data.eventId === id) {
                // Update local state to reflect booked seats
                setEvent(prevEvent => {
                    if (!prevEvent) return prevEvent;

                    const updatedSections = prevEvent.sections.map(section => {
                        // Find tickets that belong to this section
                        const newTicketsForSection = data.bookedTickets.filter(t => t.sectionId === section._id);
                        const newSeatNumbers = newTicketsForSection.map(t => t.seatNumber);

                        if (newSeatNumbers.length > 0) {
                            return {
                                ...section,
                                bookedSeats: [...new Set([...section.bookedSeats, ...newSeatNumbers])]
                            };
                        }
                        return section;
                    });

                    return { ...prevEvent, sections: updatedSections };
                });

                // Also update selectedSection if needed
                setSelectedSection(prev => {
                    if (!prev) return prev;
                    const newTicketsForSection = data.bookedTickets.filter(t => t.sectionId === prev._id);
                    const newSeatNumbers = newTicketsForSection.map(t => t.seatNumber);

                    if (newSeatNumbers.length > 0) {
                        return {
                            ...prev,
                            bookedSeats: [...new Set([...prev.bookedSeats, ...newSeatNumbers])]
                        };
                    }
                    return prev;
                });

                toast.info("Seats updated in real-time!");
            }
        });

        return () => newSocket.close();
    }, [id]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Use API_URL constant
                const response = await axios.get(`${API_URL}/events/${id}`, { headers: authHeader() });
                console.log("Fetched Event Data:", response.data); // DEBUG Log
                setEvent(response.data);
                if (response.data.sections && response.data.sections.length > 0) {
                    setSelectedSection(response.data.sections[0]);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
                toast.error("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchEvent();
    }, [id]);

    const handleSeatClick = (seatId) => {
        if (selectedSection.bookedSeats.includes(seatId)) return;

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            // Limit max seats selection if needed
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBooking = async () => {
        if (selectedSeats.length === 0) {
            toast.error("Please select at least one seat");
            return;
        }

        setBookingLoading(true);
        try {
            const dynamicPrice = Math.round(selectedSection.price * (event.currentMultiplier || 1));
            const totalAmount = selectedSeats.length * dynamicPrice;

            // 1. Load Razorpay SDK
            const res = await loadRazorpay();
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setBookingLoading(false);
                return;
            }

            // 2. Create Order on Backend
            let orderData;
            try {
                orderData = await axios.post(`${API_URL}/payment/order`, {
                    amount: totalAmount
                }, { headers: authHeader() });
            } catch (err) {
                console.warn("Payment Order Creation Failed (Likely due to missing keys). Falling back to direct booking.", err);
                // Fallback to direct booking for testing/demo if payment fails
                await directBooking();
                return;
            }

            if (!orderData.data.success) {
                toast.error("Order creation failed");
                setBookingLoading(false);
                return;
            }

            const { order, key_id } = orderData.data;

            // 3. Open Razorpay Options
            const options = {
                key: key_id,
                amount: order.amount,
                currency: order.currency,
                name: "BookMySeat",
                description: `Booking for ${event.title}`,
                image: "https://example.com/your_logo", // You can replace this
                order_id: order.id,
                handler: async function (response) {
                    // 4. Verify & Book on Backend
                    try {
                        const tickets = selectedSeats.map(seat => ({
                            sectionId: selectedSection._id,
                            seatNumber: seat
                        }));

                        const bookingRes = await axios.post(`${API_URL}/bookings`, {
                            eventId: event._id,
                            tickets,
                            paymentDetails: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            }
                        }, { headers: authHeader() });

                        toast.success("Payment Successful! Booking Confirmed.");

                        // Show Success Modal with QR
                        setBookingResult(bookingRes.data);
                        setShowSuccessModal(true);
                        setSelectedSeats([]);
                    } catch (err) {
                        console.error("Booking Confirmation Error:", err);
                        toast.error("Payment successful but booking failed. Please contact support.");
                    } finally {
                        setBookingLoading(false);
                    }
                },
                prefill: {
                    name: "User Name", // You could fetch this from user profile
                    email: "user@example.com",
                    contact: "9999999999"
                },
                notes: {
                    address: "BookMySeat Corporate Office"
                },
                theme: {
                    color: "#3399cc"
                },
                modal: {
                    ondismiss: function () {
                        setBookingLoading(false);
                        toast.info("Payment cancelled");
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                toast.error(response.error.description);
                setBookingLoading(false);
            });
            paymentObject.open();

        } catch (error) {
            console.error("Booking/Payment error:", error);
            // Fallback if everything else fails
            await directBooking();
        }
    };

    const directBooking = async () => {
        try {
            console.log("Attempting Direct Booking...");
            const tickets = selectedSeats.map(seat => ({
                sectionId: selectedSection._id,
                seatNumber: seat
            }));

            console.log(`Posting to: ${API_URL}/bookings`);

            const response = await axios.post(`${API_URL}/bookings`, {
                eventId: event._id,
                tickets
            }, { headers: authHeader() });

            toast.success("Booking successful!");
            setBookingResult(response.data);
            setShowSuccessModal(true);
            setSelectedSeats([]);
        } catch (error) {
            console.error("Direct Booking error:", error);
            console.error("Full Error Response:", error.response);

            if (error.response?.status === 401) {
                toast.error("Session Expired. Please Login Again.", {
                    description: "Your security token is no longer valid."
                });
                // Optional: router.push('/login');
            } else {
                toast.error(error.response?.data?.message || "Booking failed");
            }
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
    if (!event) return <div className="flex justify-center items-center h-screen text-white">Event not found</div>;

    const NavItems = [
        { label: 'Home', url: '/user', icons: '' },
        { label: 'Club', url: '/user/club', icons: '' },
        { label: 'Events', url: '/user/events', icons: '' },
        { label: 'About Us', url: '/user/about', icons: '' },
        { label: 'My Bookings', url: '/user/bookings', icons: '' }
    ];

    // Helper to get image source safely
    const getHeroImageSrc = () => {
        // Prioritize Banner
        if (event.banner && event.banner.data) {
            return bufferToUrl(event.banner.data, event.banner.contentType);
        }
        // Fallback to Poster
        if (event.poster && event.poster.data) {
            return bufferToUrl(event.poster.data, event.poster.contentType);
        }
        return null;
    }

    const bannerSrc = getHeroImageSrc();




    return (
        <div className='min-h-screen bg-zinc-950 text-white selection:bg-rose-500/30 pb-20'>
            <Header NavigationItems={NavItems} />

            {/* Hero Banner with Blur Fade */}
            <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden flex items-center justify-center bg-zinc-900/50">
                {bannerSrc ? (
                    <Image
                        src={bannerSrc}
                        alt={event.title}
                        fill
                        className={`object-cover ${isEventEnded ? 'grayscale' : ''} transition-all duration-500`}
                        priority
                        onError={(e) => {
                            console.error("Image Load Error:", e);
                            e.target.style.display = 'none'; // Hide broken image
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        {/* Fallback pattern or distinct placeholder */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950"></div>
                        <span className="relative text-zinc-600 font-bold text-3xl uppercase tracking-widest border border-zinc-700 p-4 rounded-lg">
                            No Banner Available
                        </span>
                    </div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>

                <div className="absolute bottom-0 inset-x-0 pb-12 pt-32 bg-gradient-to-t from-zinc-950 to-transparent">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col gap-4 max-w-4xl">
                            <div className="flex flex-wrap gap-3 items-center">
                                <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                    {event.category}
                                </span>
                                {isEventEnded ? (
                                    <span className="px-3 py-1 bg-zinc-500/20 text-zinc-400 border border-zinc-500/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                        Event Ended
                                    </span>
                                ) : event.currentMultiplier > 1 && (
                                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                                        High Demand
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-none">
                                {event.title}
                            </h1>
                            <div className="flex items-center gap-6 text-zinc-300 text-sm md:text-base">
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {event.time}
                                </span>
                                <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    {event.location}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Description & Details */}
                    <div className="lg:col-span-7 space-y-8">
                        <section>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-rose-500 rounded-full"></span>
                                About the Event
                            </h3>
                            <div className="prose prose-invert prose-zinc max-w-none">
                                <p className="text-zinc-400 leading-relaxed whitespace-pre-line text-lg">
                                    {event.description || "No description available."}
                                </p>
                            </div>
                        </section>

                        {/* Additional info or map could go here */}
                    </div>

                    {/* Right Column: Floating Booking Card */}
                    <div className="lg:col-span-5 h-full">
                        <div className={`sticky top-24 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl p-6 lg:p-8 ${isEventEnded ? 'opacity-75 pointer-events-none grayscale' : ''}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-white">
                                    {isEventEnded ? "Booking Closed" : "Book Your Seats"}
                                </h3>
                                {selectedSeats.length > 0 && (
                                    <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                                        {selectedSeats.length} SEATS SELECTED
                                    </span>
                                )}
                            </div>

                            {/* Section Tabs */}
                            <div className="space-y-4 mb-8">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Section</label>
                                <div className="flex gap-3 flex-wrap">
                                    {event.sections && event.sections.map(section => {
                                        const basePrice = section.price;
                                        const dynamicPrice = Math.round(basePrice * (event.currentMultiplier || 1));
                                        const isSelected = selectedSection && selectedSection._id === section._id;

                                        return (
                                            <button
                                                key={section._id}
                                                disabled={isEventEnded}
                                                onClick={() => {
                                                    setSelectedSection(section);
                                                    setSelectedSeats([]);
                                                }}
                                                className={`
                                                relative px-4 py-3 rounded-xl border flex-1 min-w-[120px] transition-all duration-300
                                                ${isSelected
                                                        ? 'bg-rose-600/10 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                                                        : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10'
                                                    }
                                                ${isEventEnded ? 'cursor-not-allowed opacity-50' : ''}
                                            `}
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-rose-400' : ''}`}>{section.name}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-lg font-bold">₹{dynamicPrice}</span>
                                                        {!isEventEnded && event.currentMultiplier > 1 && (
                                                            <div className="group relative">
                                                                <svg className="w-3.5 h-3.5 text-blue-400 cursor-help" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-zinc-900 border border-white/10 p-2 rounded-lg text-[10px] text-zinc-300 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                                                                    <p className="font-bold text-white mb-0.5">High Demand!</p>
                                                                    Prices increased by {Math.round((event.currentMultiplier - 1) * 100)}% due to limited seats.
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Seat Map */}
                            {selectedSection && (
                                <div className="mb-8 p-6 bg-zinc-950/50 rounded-xl border border-white/5">
                                    {/* Screen Indicator */}
                                    <div className="w-full mb-8 flex flex-col items-center gap-2">
                                        <div className="w-3/4 h-1.5 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Stage / Screen</span>
                                    </div>

                                    <div
                                        className="grid gap-2 mx-auto w-fit"
                                        style={{ gridTemplateColumns: `repeat(${selectedSection.cols}, minmax(0, 1fr))` }}
                                    >
                                        {Array.from({ length: selectedSection.rows * selectedSection.cols }).map((_, i) => {
                                            const row = String.fromCharCode(65 + Math.floor(i / selectedSection.cols));
                                            const col = (i % selectedSection.cols) + 1;
                                            const seatId = `${row}${col}`;
                                            const isBooked = selectedSection.bookedSeats.includes(seatId);
                                            const isSelected = selectedSeats.includes(seatId);

                                            return (
                                                <button
                                                    key={seatId}
                                                    disabled={isBooked || isEventEnded}
                                                    onClick={() => handleSeatClick(seatId)}
                                                    className={`
                                                        w-7 h-7 rounded-sm flex items-center justify-center text-[9px] font-medium transition-all duration-200
                                                        ${isBooked
                                                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-transparent'
                                                            : isSelected
                                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110 border border-emerald-400'
                                                                : 'bg-zinc-800 text-zinc-400 border border-white/5 hover:border-white/20 hover:bg-zinc-700'
                                                        }
                                                        ${isEventEnded ? 'cursor-not-allowed' : ''}
                                                    `}
                                                    title={seatId}
                                                >
                                                    {/* Show visual dot or number */}
                                                    {/* {isSelected || !isBooked ? '' : '✕'} */}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-zinc-800 border border-white/10"></div>
                                            <span className="text-xs text-zinc-400">Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400 shadow-sm"></div>
                                            <span className="text-xs text-white">Selected</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-zinc-800 text-zinc-600"></div>
                                            <span className="text-xs text-zinc-500">Booked</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary & Checkout */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end pb-4 border-b border-white/5">
                                    <span className="text-zinc-400 text-sm">Total Payable</span>
                                    <span className="text-3xl font-bold text-white tracking-tight">
                                        ₹{selectedSection ? (selectedSeats.length * Math.round(selectedSection.price * (event.currentMultiplier || 1))).toLocaleString() : 0}
                                    </span>
                                </div>
                                <Button
                                    className={`
                                        w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 
                                        text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-rose-500/25 
                                        transition-all active:scale-[0.98]
                                        ${bookingLoading ? 'opacity-80 cursor-wait' : ''}
                                        ${isEventEnded ? 'opacity-50 cursor-not-allowed from-zinc-700 to-zinc-700 hover:from-zinc-700 hover:to-zinc-700 shadow-none' : ''}
                                    `}
                                    size="lg"
                                    isLoading={bookingLoading}
                                    onClick={() => handleBooking()}
                                    disabled={selectedSeats.length === 0 || isEventEnded}
                                >
                                    {isEventEnded
                                        ? 'Event Ended'
                                        : bookingLoading
                                            ? 'Processing...'
                                            : `Pay & Book ${selectedSeats.length > 0 ? selectedSeats.length : ''} Ticket${selectedSeats.length !== 1 ? 's' : ''}`
                                    }
                                </Button>
                                {!isEventEnded && (
                                    <p className="text-center text-xs text-zinc-500 mt-2">
                                        Secure payment powered by Razorpay
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Success Modal with QR Code */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="bg-white dark:bg-zinc-900 text-black dark:text-white border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold text-green-600">Booking Confirmed!</DialogTitle>
                        <DialogDescription className="text-center">
                            Your tickets have been successfully booked.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center py-4 gap-4">
                        {bookingResult?.qrCode && (
                            <div className="p-4 bg-white rounded-xl shadow-md border border-zinc-200">
                                <img
                                    src={bookingResult.qrCode}
                                    alt="Ticket QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                        )}
                        <div className="text-center space-y-1">
                            <p className="font-semibold">Event: {event?.title}</p>
                            <p className="text-sm text-zinc-500">Check your email for the ticket copy.</p>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-center">
                        <Button
                            onClick={() => router.push('/user/bookings')}
                            className="bg-blue-600 text-white"
                        >
                            View My Bookings
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowSuccessModal(false)}
                            className="border-zinc-300 dark:border-zinc-700"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventDetailsPage;
