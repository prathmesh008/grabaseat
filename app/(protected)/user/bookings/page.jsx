'use client'
import React, { useEffect, useState } from 'react';
import Header from '@/app/(protected)/_components/header'
import axios from 'axios'
import config from '@/app/config'
import authHeader from '@/services/authHeader';

const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const NavItems = [
        { label: 'Home', url: '/user', icons: '' },
        { label: 'Club', url: '/user/club', icons: '' },
        { label: 'Events', url: '/user/events', icons: '' },
        { label: 'About Us', url: '/user/about', icons: '' },
        { label: 'My Bookings', url: '/user/bookings', icons: '' }
    ]

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/bookings`, { headers: authHeader() });
                setBookings(response.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    return (
        <div className='min-h-screen bg-zinc-950 text-white selection:bg-rose-500/30 pb-10'>
            <Header NavigationItems={NavItems} />

            {/* Wide Hero Banner */}
            <div className="relative h-[300px] w-full overflow-hidden flex items-center justify-center bg-zinc-900 border-b border-white/5">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

                <div className="container mx-auto px-6 relative z-10 pt-20">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-2">
                        My Bookings
                    </h1>
                    <div className="text-zinc-400 text-lg">
                        {bookings.length} {bookings.length === 1 ? 'Experience' : 'Experiences'} unlocked
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-6xl -mt-10 relative z-20">
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {[1, 2].map(i => (
                            <div key={i} className="h-48 bg-zinc-900/50 rounded-2xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 border border-white/5 rounded-3xl backdrop-blur-md">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                        </div>
                        <p className="text-lg text-zinc-300">No bookings yet</p>
                        <a href="/user" className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all">
                            Explore Events &rarr;
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="relative group bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 flex flex-col sm:flex-row hover:shadow-2xl hover:shadow-black/50">
                                {/* Left Side: Event Details */}
                                <div className="flex-1 p-6 relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${booking.status === 'CONFIRMED'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <h2 className="text-xl font-bold mt-2 text-white group-hover:text-rose-500 transition-colors">
                                                {booking.event?.title || "Unknown Event"}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-zinc-400">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            {booking.event?.date ? new Date(booking.event.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </div>
                                        <div className="flex items-center text-sm text-zinc-400">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            {booking.event?.location || "Venue TBA"}
                                        </div>
                                    </div>

                                    <div className="space-y-1 bg-zinc-950/50 p-3 rounded-lg border border-white/5">
                                        {booking.tickets.map((ticket, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-zinc-300">
                                                <span>{ticket.sectionName} • Seat {ticket.seatNumber}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Perforation Circles (Visual) */}
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-950 rounded-full sm:block hidden border-l border-white/10"></div>
                                </div>

                                {/* Right Side: QR & Actions */}
                                <div className="sm:w-48 bg-white/5 backdrop-blur-sm border-l border-white/5 p-6 flex flex-col items-center justify-center gap-4 relative">
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-950 rounded-full sm:block hidden border-r border-white/10"></div>

                                    {/* QR Code */}
                                    <div className="w-24 h-24 bg-white rounded-lg p-1">
                                        {booking.qrCode ? (
                                            <img src={booking.qrCode} alt="QR" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-400 text-center leading-tight">
                                                QR Pending
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Paid</div>
                                        <div className="text-lg font-bold">₹{booking.totalAmount}</div>
                                    </div>

                                    <button className="w-full text-xs font-medium py-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 border border-white/5">
                                        Download Ticket
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingsPage;
