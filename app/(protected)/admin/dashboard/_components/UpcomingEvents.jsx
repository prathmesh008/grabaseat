'use client'
import React from 'react';
import { PlusIcon } from '@radix-ui/react-icons';

const UpcomingEvents = ({ events }) => {
    return (
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-white/5 p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-lg font-bold text-white">Upcoming This Week</h3>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-lg shadow-indigo-500/25">
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3 relative z-10">
                {events.slice(0, 3).map((event, i) => (
                    <div key={i} className="flex items-center gap-4 bg-zinc-950/40 border border-white/5 p-3 rounded-xl hover:border-indigo-500/30 transition-colors cursor-pointer group">
                        <div className="flex flex-col items-center bg-zinc-900 rounded-lg p-2 min-w-[50px] border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                            <span className="text-xs text-rose-400 font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-bold text-white">{new Date(event.date).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                            <p className="text-xs text-zinc-400">{event.time} • {event.location}</p>
                        </div>
                    </div>
                ))}
                {events.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">No events this week.</p>}
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/5 transition-all">
                View Calendar
            </button>
        </div>
    );
};

export default UpcomingEvents;
