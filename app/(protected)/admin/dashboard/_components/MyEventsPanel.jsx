'use client'
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, ClockIcon, Pencil1Icon, EyeOpenIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

const MyEventsPanel = ({ events = [], isLoading }) => {
    // Helper to safely convert buffer to base64
    const bufferToBase64 = (buffer) => {
        if (typeof window === 'undefined') return ''; // SSH/Server-side check
        if (!buffer) return '';
        try {
            if (buffer.type === 'Buffer' && Array.isArray(buffer.data)) {
                buffer = buffer.data;
            }
            if (Array.isArray(buffer)) {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                const chunkSize = 8192;
                for (let i = 0; i < len; i += chunkSize) {
                    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
                }
                return window.btoa(binary);
            }
        } catch (e) {
            console.error("Image conversion error", e);
            return '';
        }
        return '';
    };

    if (isLoading) {
        return (
            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6 animate-pulse space-y-4 h-[500px]">
                <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 w-full bg-zinc-800/50 rounded-xl" />)}
                </div>
            </div>
        )
    }

    const safeEvents = Array.isArray(events) ? events : [];

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center z-20 bg-zinc-900/80 backdrop-blur-md sticky top-0">
                <div>
                    <h3 className="text-lg font-bold text-white">My Events</h3>
                    <p className="text-zinc-500 text-xs">
                        {safeEvents.length} Active Events
                    </p>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                {safeEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                        <p>No events found.</p>
                        <p className="text-xs text-zinc-600">Create an event to see it here.</p>
                    </div>
                ) : (
                    safeEvents.map((event, index) => {
                        const imageSrc = event.poster
                            ? `data:${event.poster.contentType || 'image/jpeg'};base64,${bufferToBase64(event.poster.data)}`
                            : null;

                        return (
                            <div
                                key={event._id}
                                className="group w-full bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden flex items-center hover:bg-zinc-800/30 transition-all duration-300"
                            >
                                {/* Left Image Section */}
                                <div className="w-24 h-24 relative bg-zinc-800 shrink-0">
                                    {imageSrc ? (
                                        <Image
                                            src={imageSrc}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-[8px] text-zinc-600 gap-1">
                                            <CalendarIcon />
                                            <span>No Img</span>
                                        </div>
                                    )}
                                </div>

                                {/* Right Content Section */}
                                <div className="flex-1 p-4 flex flex-col justify-between h-24">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-bold text-white line-clamp-1">{event.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                                                <span className="bg-white/5 px-2 py-0.5 rounded text-zinc-300">{event.category}</span>
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toast.info("Edit feature coming in v2.0"); }}
                                                className="p-1.5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil1Icon className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/user/event/${event._id}`}
                                                target="_blank"
                                                className="p-1.5 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <EyeOpenIcon className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-2 flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${(event.bookedSeatsCount / (event.totalSeats || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-zinc-500 font-mono">
                                            {event.bookedSeatsCount}/{event.totalSeats || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MyEventsPanel;
