'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarIcon, RocketIcon, BackpackIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import config from '@/app/config';
import { io } from "socket.io-client";

// Components
import AdminNavbar from './_components/AdminNavbar';
import AnalyticsCard from './_components/AnalyticsCard';
import ChartsSection from './_components/ChartsSection';
import MyEventsPanel from './_components/MyEventsPanel';
import RecentRegistrations from './_components/RecentRegistrations';
import UpcomingEvents from './_components/UpcomingEvents';
import NewEvents from './_components/NewEvents';

import { Toaster, toast } from 'sonner';

// Auth Helper
import authHeader from '@/services/authHeader';

const DashboardPage = () => {
    const router = useRouter();
    const [stats, setStats] = useState({ totalEvents: 0, totalBookings: 0, totalRevenue: 0, activeEventsToday: 0 });
    const [events, setEvents] = useState([]);
    const [recentRegistrations, setRecentRegistrations] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [chartData, setChartData] = useState({ revenueTrend: [], categoryDistribution: [] });
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isNewEventOpen, setIsNewEventOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();

        // 1. Initialize Socket Connection
        // IMPORTANT: In prod, config.API_URL will likely be the full backend URL. 
        // If config.API_URL has /api suffix, we need to extract the base URL.
        const socketUrl = config.API_URL ? new URL(config.API_URL).origin : "http://localhost:8000";
        const newSocket = io(socketUrl);

        // 2. Listen for 'dashboard_update' events
        newSocket.on("dashboard_update", (data) => {
            console.log("Real-time Dashboard Update Received:", data);
            toast.info("New Booking Received! Updating Dashboard...");
            fetchDashboardData();
        });

        // 3. Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Only set loading true if it's the initial load to avoid flickering on updates
            // (We handle this by checking if data exists, or just minimal flicker)
            // For now, let's keep loading=true to show activity, or better:
            // setLoading(true); 

            const headers = authHeader();

            // Fetch All Data in Parallel
            const [statsRes, eventsRes, regsRes, upcomingRes, chartsRes] = await Promise.all([
                axios.get(`${config.API_URL}/admin/analytics`, { headers }),
                axios.get(`${config.API_URL}/admin/events`, { headers }),
                axios.get(`${config.API_URL}/admin/registrations/recent`, { headers }),
                axios.get(`${config.API_URL}/admin/events/upcoming`, { headers }),
                axios.get(`${config.API_URL}/admin/charts`, { headers })
            ]);

            setStats(statsRes.data);
            setEvents(eventsRes.data);
            setRecentRegistrations(regsRes.data);
            setUpcomingEvents(upcomingRes.data);
            setChartData(chartsRes.data);
            setLoading(false); // Ensure loading is false after data arrives

        } catch (error) {
            console.error("Dashboard fetch error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error("Session expired or unauthorized. Please login again.");
                localStorage.removeItem("user");
                router.push("/");
            } else {
                toast.error("Failed to load dashboard data.");
            }
            setLoading(false);
        }
    };

    const handleEventCreated = () => {
        fetchDashboardData(); // Refresh data on new event
        setIsNewEventOpen(false);
    }

    // Welcome Date
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
            <Toaster position="bottom-right" theme="dark" />
            <AdminNavbar />

            <main className="container mx-auto px-6 pt-24 pb-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-fade-in">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-zinc-400 mb-2"
                        >
                            <CalendarIcon className="w-3 h-3" />
                            <span>{today}</span>
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
                        <p className="text-zinc-400 mt-1">Welcome back, here&apos;s what&apos;s happening with your events today.</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                            Quick Reports
                        </button>
                        <button
                            onClick={() => setIsNewEventOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
                        >
                            <RocketIcon className="w-4 h-4" /> Create Event
                        </button>
                    </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AnalyticsCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toLocaleString()}`}
                        icon={LightningBoltIcon}
                        color="indigo"
                        trend={12}
                        delay={0.1}
                    />
                    <AnalyticsCard
                        title="Total Events"
                        value={stats.totalEvents}
                        icon={CalendarIcon}
                        color="rose"
                        delay={0.2}
                    />
                    <AnalyticsCard
                        title="Bookings"
                        value={stats.totalBookings}
                        icon={BackpackIcon}
                        color="emerald"
                        trend={8}
                        delay={0.3}
                    />
                    <AnalyticsCard
                        title="Active Today"
                        value={stats.activeEventsToday}
                        icon={RocketIcon}
                        color="amber"
                        delay={0.4}
                    />
                </div>

                {/* Charts & Graphs Area */}
                <ChartsSection
                    revenueTrend={chartData.revenueTrend}
                    categoryDistribution={chartData.categoryDistribution}
                />

                {/* content split: Events List & sidebar */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8 h-[600px]">
                    {/* Left: My Events Table */}
                    <div className="xl:col-span-2 h-full">
                        <MyEventsPanel events={events} isLoading={loading} />
                    </div>

                    {/* Right: Sidebar Widgets */}
                    <div className="h-full">
                        <UpcomingEvents events={upcomingEvents} />
                    </div>
                </div>

                {/* Bottom: Recent Activity Full Width */}
                <div className="w-full">
                    <RecentRegistrations registrations={recentRegistrations} isLoading={loading} />
                </div>
            </main>

            {/* New Event Modal */}
            {isNewEventOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-950 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative">
                        <button
                            onClick={() => setIsNewEventOpen(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white"
                        >
                            ✕
                        </button>
                        <NewEvents onClose={() => setIsNewEventOpen(false)} onCreated={handleEventCreated} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
