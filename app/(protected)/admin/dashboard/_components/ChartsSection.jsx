'use client'
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ChartsSection = ({ revenueTrend = [], categoryDistribution = [] }) => {

    // 1. Force Number Coercion and Precise Max Calculation
    const revenueValues = revenueTrend.map(d => Number(d.revenue) || 0);
    const rawMax = Math.max(...revenueValues);
    const maxRevenue = rawMax > 0 ? rawMax : 100;

    // Define colors explicitly for the Pie Chart
    const COLORS = ['#f43f5e', '#6366f1', '#f59e0b', '#10b981', '#06b6d4'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Revenue Trend (HTML/CSS Bar Chart) */}
            <div className="p-6 rounded-3xl border border-white/5 bg-zinc-900/50 backdrop-blur-xl h-[400px] flex flex-col">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
                    <p className="text-xs text-zinc-500">Last 7 Days Earnings</p>
                </div>

                <div className="flex-1 w-full relative flex items-end gap-3 px-2 pb-4">
                    {/* Background Lines */}
                    <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-10 z-0">
                        <div className="border-t border-zinc-500 w-full h-px"></div>
                        <div className="border-t border-zinc-500 w-full h-px"></div>
                        <div className="border-t border-zinc-500 w-full h-px"></div>
                        <div className="border-t border-zinc-500 w-full h-px"></div>
                    </div>

                    {revenueTrend.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 z-10">
                            No Revenue Data Available
                        </div>
                    ) : (
                        revenueTrend.map((item, i) => {
                            const rev = Number(item.revenue) || 0;
                            const heightPerc = (rev / maxRevenue) * 100;
                            // Visual height logic
                            const displayHeight = rev === 0 ? 2 : Math.max(heightPerc, 2);

                            return (
                                <div key={i} className="flex-1 group relative h-full flex items-end z-10">
                                    <div className="w-full h-full flex items-end relative">
                                        <div
                                            style={{ height: `${displayHeight}%` }}
                                            className={`
                                                w-full rounded-t-sm transition-all duration-700 ease-out
                                                ${rev > 0 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5'}
                                                relative
                                            `}
                                        >
                                            {rev > 0 && <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-indigo-400 opacity-90 rounded-t-sm" />}

                                            {/* Tooltip */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 text-white text-[10px] py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                                                <p className="font-bold mb-0.5">₹{rev.toLocaleString()}</p>
                                                <p className="text-zinc-500 text-[9px]">{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                                        {new Date(item.date).getDate()}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Top Categories (Recharts Pie Chart) */}
            <div className="p-6 rounded-3xl border border-white/5 bg-zinc-900/50 backdrop-blur-xl h-[400px] flex flex-col">
                <div className="mb-2">
                    <h3 className="text-lg font-bold text-white">Top Categories</h3>
                    <p className="text-xs text-zinc-500">By Revenue Share</p>
                </div>
                <div className="flex-1 w-full h-full relative">
                    {categoryDistribution.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">No Category Data</div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryDistribution.map(c => ({
                                            name: c.category || 'General',
                                            value: Number(c.revenue || 0)
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-zinc-400 text-xs ml-2 font-medium">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ChartsSection;