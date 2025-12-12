'use client'
import React from 'react';
import { PersonIcon } from '@radix-ui/react-icons';
import { formatDistanceToNow } from 'date-fns';

const RecentRegistrations = ({ registrations, isLoading }) => {

    if (isLoading) {
        return (
            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6 animate-pulse space-y-4">
                <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 w-full bg-zinc-800/50 rounded-full" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    <p className="text-zinc-500 text-xs">Latest ticket bookings</p>
                </div>
                <button className="text-sm font-medium text-rose-400 hover:text-rose-300">
                    View Reports
                </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] p-2 custom-scrollbar">
                {registrations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                        <p>No recent bookings.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-xs text-zinc-400 uppercase tracking-wider sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="px-4 py-3 font-medium rounded-l-lg">User</th>
                                <th className="px-4 py-3 font-medium">Event</th>
                                <th className="px-4 py-3 font-medium text-right">Amount</th>
                                <th className="px-4 py-3 font-medium rounded-r-lg text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {registrations.map((reg, index) => (
                                <tr
                                    key={reg.id}
                                    className="group hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                                <span className="text-xs font-bold">{reg.userName?.[0] || 'U'}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{reg.userName}</p>
                                                <p className="text-[10px] text-zinc-500 truncate max-w-[100px]">{reg.userEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-zinc-300 truncate max-w-[120px]">{reg.eventName}</span>
                                            <span className="text-[10px] text-zinc-500">{reg.seats} seats</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-bold text-white">₹{reg.amount}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-xs text-zinc-500">
                                            {formatDistanceToNow(new Date(reg.timestamp), { addSuffix: true })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default RecentRegistrations;
